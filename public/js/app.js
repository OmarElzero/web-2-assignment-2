const STORAGE_AUTH = "movieAppAuth";
const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL)
  ? window.APP_CONFIG.API_BASE_URL.replace(/\/$/, "")
  : `${window.location.origin}/api`;
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const views = {
  home: document.getElementById("homeSection"),
  details: document.getElementById("detailsSection"),
  login: document.getElementById("loginSection"),
  signup: document.getElementById("signupSection"),
  profile: document.getElementById("profileSection"),
};

const state = {
  started: false,
  currentView: "home",
  currentGenre: "all",
};

function getAuthState() {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getLoggedInUser() {
  const auth = getAuthState();
  return auth && auth.user ? auth.user : null;
}

function getAuthToken() {
  const auth = getAuthState();
  return auth && auth.token ? auth.token : null;
}

function setLoggedInUser(payload) {
  const user = payload.user || {};
  const mappedUser = {
    id: user.id,
    role: user.role,
    name: user.full_name || user.name || "User",
    email: user.email || "",
  };

  localStorage.setItem(STORAGE_AUTH, JSON.stringify({
    token: payload.access_token || payload.token || "",
    user: mappedUser,
  }));
}

function removeLoggedInUser() {
  localStorage.removeItem(STORAGE_AUTH);
}

function getWatchlistKey() {
  const user = getLoggedInUser();
  return user ? `movieAppWatchlist_${user.email}` : null;
}

function getWatchlist() {
  const key = getWatchlistKey();
  if (!key) return [];
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function saveWatchlist(watchlist) {
  const key = getWatchlistKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(watchlist));
}

function isUserLoggedIn() {
  return Boolean(getLoggedInUser() && getAuthToken());
}

function getErrorMessage(result, fallbackMessage) {
  if (!result || typeof result !== "object") return fallbackMessage;
  if (result.error && typeof result.error.message === "string") {
    return result.error.message;
  }
  if (typeof result.message === "string" && result.message.trim()) {
    return result.message;
  }
  return fallbackMessage;
}

async function apiFetch(path, { method = "GET", body = null, auth = true } = {}) {
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Server returned an invalid JSON response.");
  }

  if (!response.ok || !payload || payload.ok !== true) {
    throw new Error(getErrorMessage(payload, `Request failed (${response.status})`));
  }

  return payload.data || {};
}

async function movieApiFetch(path, { method = "GET", body = null } = {}) {
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Server returned an invalid JSON response.");
  }

  if (!response.ok) {
    const message = (payload && payload.message)
      || (payload && payload.errors && Object.values(payload.errors).flat()[0])
      || getErrorMessage(payload, `Request failed (${response.status})`);
    throw new Error(message);
  }

  return payload;
}

async function fetchUserMovies() {
  const payload = await movieApiFetch("/movies");
  return Array.isArray(payload.data) ? payload.data : [];
}

const MOVIE_STATUSES = ["want_to_watch", "watching", "watched", "dropped"];

function normalizeStoredTmdbId(tmdbMovieId) {
  return String(tmdbMovieId || "").replace(/^tmdb:/, "").trim();
}

function parseStoredTmdbId(imdbId) {
  if (!imdbId) return "";
  return String(imdbId).replace(/^tmdb:/, "").trim();
}

function validateMovieRating(rating) {
  if (rating === null || rating === undefined || rating === "") {
    return { valid: true, message: "" };
  }
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 10) {
    return { valid: false, message: "Rating must be a whole number between 1 and 10." };
  }
  return { valid: true, message: "" };
}

function validateWatchlistMovieData({ title, status, rating }) {
  const trimmedTitle = (title || "").trim();
  if (!trimmedTitle) {
    return { valid: false, message: "Movie title is required." };
  }
  if (trimmedTitle.length > 255) {
    return { valid: false, message: "Title must be 255 characters or fewer." };
  }
  if (!status || !MOVIE_STATUSES.includes(status)) {
    return { valid: false, message: "Please select a valid watch status." };
  }
  return validateMovieRating(rating);
}

function validateMovieUpdateData({ status, rating }) {
  if (!status || !MOVIE_STATUSES.includes(status)) {
    return { valid: false, message: "Please select a valid watch status." };
  }
  return validateMovieRating(rating);
}

async function updateWatchlistMovie(movieId, { status, rating }) {
  const validation = validateMovieUpdateData({ status, rating });
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const body = { status };
  if (rating === null || rating === undefined || rating === "") {
    body.rating = null;
  } else {
    body.rating = Number(rating);
  }

  return movieApiFetch(`/movies/${movieId}`, { method: "PUT", body });
}

function createWatchlistEditPanel(movie) {
  const panel = document.createElement("div");
  panel.className = "watchlist-edit";
  panel.innerHTML = `
    <label class="watchlist-edit__label">Status
      <select class="watchlist-edit__select" data-field="status">
        ${MOVIE_STATUSES.map(value => `<option value="${value}" ${movie.status === value ? "selected" : ""}>${value.replace(/_/g, " ")}</option>`).join("")}
      </select>
    </label>
    <label class="watchlist-edit__label">Rating (1–10)
      <input type="number" class="watchlist-edit__input" data-field="rating" min="1" max="10" value="${movie.rating != null ? movie.rating : ""}" placeholder="Optional">
    </label>
    <button type="button" class="btn btn-save-watchlist">Save</button>
  `;

  panel.addEventListener("click", event => event.stopPropagation());

  const saveBtn = panel.querySelector(".btn-save-watchlist");
  saveBtn.addEventListener("click", async event => {
    event.stopPropagation();
    const status = panel.querySelector('[data-field="status"]').value;
    const ratingRaw = panel.querySelector('[data-field="rating"]').value;
    const validation = validateWatchlistMovieData({
      title: movie.title,
      status,
      rating: ratingRaw,
    });
    if (!validation.valid) {
      showAppMessage(validation.message, "error");
      return;
    }
    try {
      await updateWatchlistMovie(movie.id, { status, rating: ratingRaw });
      showAppMessage("Watchlist updated.", "success");
      await renderProfilePage();
    } catch (error) {
      showAppMessage(error.message || "Failed to update movie.", "error");
    }
  });

  return panel;
}

async function registerUser(name, email, password) {
  return apiFetch("/users/register.php", {
    method: "POST",
    auth: false,
    body: {
      full_name: name,
      email,
      password,
    },
  });
}

async function authenticateUser(email, password) {
  return apiFetch("/users/login.php", {
    method: "POST",
    auth: false,
    body: {
      email,
      password,
    },
  });
}

function showAppMessage(text, type = "info") {
  const messageEl = document.getElementById("appMessage");
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.className = `app-message app-message--${type}`;
  if (text) {
    messageEl.hidden = false;
    window.setTimeout(() => {
      messageEl.hidden = true;
    }, 4500);
  }
}

function clearAppMessage() {
  const messageEl = document.getElementById("appMessage");
  if (!messageEl) return;
  messageEl.hidden = true;
  messageEl.textContent = "";
  messageEl.className = "app-message";
}

function setActiveNavLink(viewName) {
  document.querySelectorAll(".nav-link").forEach(link => {
    const target = link.dataset.view;
    if (target === viewName) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function updateNavbar() {
  const loggedIn = isUserLoggedIn();
  const user = getLoggedInUser();
  document.querySelectorAll(".guest-only").forEach(el => {
    el.style.display = loggedIn ? "none" : "inline-block";
  });
  document.querySelectorAll(".user-only").forEach(el => {
    el.style.display = loggedIn ? "inline-block" : "none";
  });
  const greeting = document.getElementById("userGreeting");
  if (greeting && user) {
    greeting.textContent = `Hi, ${user.name}`;
  }
  setActiveNavLink(state.currentView);
}

function parseHash() {
  const rawHash = window.location.hash.slice(1) || "home";
  const [viewPart, paramsPart] = rawHash.split("?");
  const params = new URLSearchParams(paramsPart || "");
  const view = Object.keys(views).includes(viewPart) ? viewPart : "home";
  return { view, params };
}

function showView(viewName, options = {}) {
  const target = views[viewName] || views.home;
  Object.values(views).forEach(section => {
    section.classList.remove("active");
  });
  target.classList.add("active");
  state.currentView = viewName;
  updateNavbar();
  clearAppMessage();

  if (viewName === "home") {
    const genre = options.genre || state.currentGenre || "all";
    state.currentGenre = genre;
    initMoviesSection(genre);
  }

  if (viewName === "details") {
    const movieId = options.movieId;
    loadDetailsPage(movieId);
  }

  if (viewName === "profile") {
    if (!isUserLoggedIn()) {
      showView("login");
      return;
    }
    renderProfilePage();
  }

  if (viewName === "login") {
    renderLoginForm();
  }

  if (viewName === "signup") {
    renderSignupForm();
  }
}

function syncUrl(viewName, options = {}) {
  let hash = `#${viewName}`;
  if (Object.keys(options).length) {
    const query = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value != null) query.set(key, value);
    });
    hash += `?${query.toString()}`;
  }
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
}

function wireNavbarLinks() {
  document.querySelectorAll("[data-view]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const target = event.currentTarget.dataset.view;
      if (target === "profile" && !isUserLoggedIn()) {
        showAppMessage("Please login first to access your profile.", "error");
        showView("login");
        syncUrl("login");
        return;
      }
      showView(target);
      syncUrl(target);
    });
  });

  const getStartedBtn = document.querySelector(".book-btn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", event => {
      event.preventDefault();
      if (isUserLoggedIn()) {
        const browseSection = document.getElementById("browse");
        if (browseSection) {
          browseSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        showView("login");
        syncUrl("login");
      }
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async event => {
      event.preventDefault();
      try {
        await apiFetch("/users/logout.php", { method: "POST", auth: true });
      } catch {
        // Client-side token deletion is still sufficient for JWT logout.
      }
      removeLoggedInUser();
      showAppMessage("You have been logged out.", "info");
      showView("home");
      syncUrl("home");
    });
  }

  const backButton = document.getElementById("backButton");
  if (backButton) {
    backButton.addEventListener("click", () => {
      showView("home");
      syncUrl("home");
    });
  }
}

function wireMobileMenu() {
  const toggle = document.querySelector(".bar-icon");
  const nav = document.querySelector(".navbar-content ul");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const isHidden = nav.style.display === "none" || getComputedStyle(nav).display === "none";
    nav.style.display = isHidden ? "flex" : "none";
  });
}

function showElementById(id, visible) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = visible ? "block" : "none";
}

function renderLoginForm() {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginFormMessage");
  if (form) form.reset();
  if (message) {
    message.textContent = "";
    message.className = "form-message";
  }
}

function renderSignupForm() {
  const form = document.getElementById("signupForm");
  const message = document.getElementById("signupFormMessage");
  if (form) form.reset();
  if (message) {
    message.textContent = "";
    message.className = "form-message";
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const message = document.getElementById("loginFormMessage");

  try {
    const authData = await authenticateUser(email, password);
    setLoggedInUser(authData);

    const user = getLoggedInUser();
    updateNavbar();
    showAppMessage(`Welcome back, ${user ? user.name : "User"}!`, "success");
    showView("home");
    syncUrl("home");
  } catch (error) {
    if (message) {
      message.textContent = error.message || "Invalid email or password.";
      message.className = "form-message form-message--error";
    }
  }
}

async function handleSignupSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const message = document.getElementById("signupFormMessage");

  try {
    await registerUser(name, email, password);
    if (message) {
      message.textContent = "Account created. Please login.";
      message.className = "form-message form-message--success";
    }
    showView("login");
    syncUrl("login");
  } catch (error) {
    if (message) {
      message.textContent = error.message || "Failed to create account.";
      message.className = "form-message form-message--error";
    }
  }
}

async function renderProfilePage() {
  const user = getLoggedInUser();
  const userName = document.getElementById("userNameDisplay");
  const userEmail = document.getElementById("userEmailDisplay");
  const watchlistCount = document.getElementById("watchlistCount");
  const reviewsCount = document.getElementById("reviewsCount");
  const grid = document.getElementById("profileMovieGrid");

  if (!user) {
    showView("login");
    syncUrl("login");
    return;
  }

  if (userName) userName.textContent = user.name;
  if (userEmail) userEmail.textContent = user.email;

  if (reviewsCount) {
    const reviewTotal = await countUserReviews();
    reviewsCount.textContent = String(reviewTotal);
  }

  if (!grid) return;
  grid.innerHTML = `<div class="movies-state">Loading your watchlist…</div>`;

  let watchlist = [];
  try {
    watchlist = await fetchUserMovies();
  } catch (error) {
    grid.innerHTML = `<div class="empty-state"><p>${escapeHtml(error.message || "Failed to load watchlist.")}</p></div>`;
    return;
  }

  if (watchlistCount) watchlistCount.textContent = String(watchlist.length);

  grid.innerHTML = "";

  if (watchlist.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>Your watchlist is currently empty.</p><a href="#home" data-view="home" class="btn btn-primary">Explore Movies</a></div>`;
    wireNavbarLinks();
    return;
  }

  watchlist.forEach(movie => {
    const tmdbId = parseStoredTmdbId(movie.imdb_id);
    const displayMovie = {
      id: tmdbId || movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.rating,
      release_date: movie.year ? `${movie.year}-01-01` : "",
    };
    const card = createMovieCard(displayMovie, false);
    card.appendChild(createWatchlistEditPanel(movie));

    const button = document.createElement("button");
    button.type = "button";
    button.className = "remove-movie-btn";
    button.textContent = "Remove";
    button.addEventListener("click", async event => {
      event.stopPropagation();
      await removeFromWatchlist(movie.id);
      await renderProfilePage();
    });
    card.appendChild(button);

    if (tmdbId) {
      card.addEventListener("click", () => {
        showView("details", { movieId: tmdbId });
        syncUrl("details", { id: tmdbId });
      });
    }
    grid.appendChild(card);
  });
}

async function removeFromWatchlist(movieId) {
  await movieApiFetch(`/movies/${movieId}`, { method: "DELETE" });
  showAppMessage("Removed from your watchlist.", "info");
}

async function isMovieInWatchlist(tmdbMovieId) {
  const storedId = normalizeStoredTmdbId(tmdbMovieId);
  const movies = await fetchUserMovies();
  return movies.some(item => {
    const itemId = parseStoredTmdbId(item.imdb_id);
    return itemId === storedId || String(item.imdb_id) === storedId;
  });
}

async function countUserReviews() {
  if (!isUserLoggedIn()) return 0;

  try {
    const payload = await movieApiFetch('/reviews/user', { method: 'GET' });
    const reviews = Array.isArray(payload.data) ? payload.data : [];
    return reviews.length;
  } catch (error) {
    console.warn('Failed to load user reviews count', error);
    return 0;
  }
}

async function fetchMovieReviews(movieId) {
  try {
    return await apiFetch(`/reviews/movie/${encodeURIComponent(movieId)}`, { method: 'GET', auth: false });
  } catch (error) {
    console.warn('Failed to fetch movie reviews', error);
    return [];
  }
}

async function saveMovieReview(movieId, review) {
  if (!isUserLoggedIn()) return false;

  try {
    const payload = await movieApiFetch('/reviews', {
      method: 'POST',
      body: {
        movie_id: movieId,
        rating: review.rating,
        text: review.text,
      },
    });
    return Boolean(payload && payload.data);
  } catch (error) {
    throw error;
  }
}

async function fetchFromTmdb(path, params = {}) {
  if (path === "/movie/popular") {
    return apiFetch(`/tmdb/popular.php?page=${encodeURIComponent(params.page || 1)}`, { auth: false });
  }

  if (path === "/genre/movie/list") {
    return apiFetch("/tmdb/genres.php", { auth: false });
  }

  if (path.startsWith("/movie/")) {
    const movieId = path.replace("/movie/", "");
    return apiFetch(`/tmdb/details.php?id=${encodeURIComponent(movieId)}`, { auth: false });
  }

  if (path === "/discover/movie") {
    return apiFetch(`/tmdb/discover.php?genre_id=${encodeURIComponent(params.with_genres || "")}&page=${encodeURIComponent(params.page || 1)}`, { auth: false });
  }

  if (path === "/search/movie") {
    return apiFetch(`/tmdb/search.php?q=${encodeURIComponent(params.query || "")}&page=${encodeURIComponent(params.page || 1)}`, { auth: false });
  }

  throw new Error(`Unsupported TMDb proxy path: ${path}`);
}

async function fetchPopularMovies(page = 1) {
  return fetchFromTmdb("/movie/popular", { page });
}

async function fetchGenres() {
  return fetchFromTmdb("/genre/movie/list");
}

async function fetchMovieDetails(movieId) {
  return fetchFromTmdb(`/movie/${movieId}`, { append_to_response: "credits" });
}

function setLoadingState(isLoading) {
  const el = document.getElementById("moviesLoading");
  if (el) el.hidden = !isLoading;
}

function setErrorState(message) {
  const el = document.getElementById("moviesError");
  if (!el) return;
  el.textContent = message;
  el.hidden = !message;
}

function createMovieCard(movie, clickable = true) {
  const card = document.createElement("article");
  card.className = `movie-card${clickable ? " movie-card--clickable" : ""}`;
  card.dataset.movieId = String(movie.id);
  const poster = movie.poster_path ? TMDB_IMG + movie.poster_path : "https://via.placeholder.com/500x750?text=No+Image";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "TBA";

  card.innerHTML = `
    <div class="movie-card-img">
      <img src="${poster}" alt="${escapeHtml(movie.title)}">
      <div class="rating-badge">⭐ ${rating}</div>
    </div>
    <div class="movie-info">
      <h3>${escapeHtml(movie.title || "Untitled")}</h3>
      <p>${escapeHtml(movie.overview || "No summary available.")}</p>
      <span class="movie-meta">Released • ${year}</span>
    </div>
  `;

  if (clickable) {
    card.addEventListener("click", () => {
      showView("details", { movieId: movie.id });
      syncUrl("details", { id: movie.id });
    });
  }

  return card;
}

function escapeHtml(text) {
  if (text === undefined || text === null) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

function renderMovies(movies) {
  const grid = document.getElementById("movieGrid");
  if (!grid) return;
  grid.innerHTML = "";
  if (!movies || movies.length === 0) {
    grid.innerHTML = '<p class="movies-empty">No movies found.</p>';
    return;
  }
  movies.forEach(movie => grid.appendChild(createMovieCard(movie)));
}

async function renderGenres(selectedGenre = "all") {
  const container = document.getElementById("genreContainer");
  if (!container) return;
  try {
    const data = await fetchGenres();
    container.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.className = `genre-btn ${selectedGenre === "all" ? "active" : ""}`;
    allBtn.textContent = "All";
    allBtn.dataset.id = "all";
    container.appendChild(allBtn);

    data.genres.forEach(genre => {
      const btn = document.createElement("button");
      btn.className = `genre-btn ${selectedGenre === String(genre.id) ? "active" : ""}`;
      btn.textContent = genre.name;
      btn.dataset.id = genre.id;
      container.appendChild(btn);
    });

    container.addEventListener("click", async event => {
      const clicked = event.target.closest(".genre-btn");
      if (!clicked) return;
      container.querySelectorAll(".genre-btn").forEach(btn => btn.classList.remove("active"));
      clicked.classList.add("active");
      const genreId = clicked.dataset.id;
      state.currentGenre = genreId;
      syncUrl("home", { genre: genreId });
      if (genreId === "all") {
        await loadPopularIntoGrid();
      } else {
        await loadMoviesByGenre(genreId);
      }
    });
  } catch (error) {
    console.error("Failed to load genres", error);
  }
}

async function loadPopularIntoGrid() {
  setErrorState("");
  setLoadingState(true);
  try {
    const data = await fetchPopularMovies(1);
    renderMovies(data.results || []);
  } catch (err) {
    setErrorState((err && err.message) || "Failed to load movies.");
  } finally {
    setLoadingState(false);
  }
}

async function loadMoviesByGenre(genreId) {
  setErrorState("");
  setLoadingState(true);
  try {
    const data = await fetchFromTmdb("/discover/movie", { with_genres: genreId });
    renderMovies(data.results || []);
  } catch (err) {
    setErrorState((err && err.message) || "Failed to filter movies.");
  } finally {
    setLoadingState(false);
  }
}

async function runSearch(query) {
  setLoadingState(true);
  try {
    if (!query.trim()) {
      return loadPopularIntoGrid();
    }
    const response = await fetchFromTmdb("/search/movie", { query: query.trim(), include_adult: false });
    renderMovies(response.results || []);
  } catch (err) {
    setErrorState((err && err.message) || "Search failed.");
  } finally {
    setLoadingState(false);
  }
}

function wireSearchForm() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  if (!form || !input) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    runSearch(input.value);
  });
}

async function initMoviesSection(genre = "all") {
  if (state.started && state.currentView === "home" && state.currentGenre === genre) return;
  state.started = true;
  state.currentGenre = genre;
  wireSearchForm();
  await renderGenres(genre);
  if (genre === "all") {
    await loadPopularIntoGrid();
  } else {
    await loadMoviesByGenre(genre);
  }
}

async function loadDetailsPage(movieId) {
  const contentArea = document.getElementById("movieDetailsContent");
  if (!contentArea) return;
  contentArea.innerHTML = `<div class="loading-spinner">Loading movie details...</div>`;
  if (!movieId) {
    contentArea.innerHTML = `<p>Movie ID is missing.</p>`;
    return;
  }

  try {
    const movie = await fetchMovieDetails(movieId);
    if (!movie || !movie.title) {
      throw new Error("Movie data is incomplete");
    }
    renderMovieDetails(movie, contentArea);
    wireReviewForm(movieId);
    await renderMovieReviews(movieId);
  } catch (error) {
    console.error("Detailed Error:", error);
    contentArea.innerHTML = `<div class="error-container"><p class="error-msg">Error loading movie details. Please try again.</p><small>Reason: ${escapeHtml(error.message)}</small></div>`;
  }
}

function renderMovieDetails(movie, container) {
  const poster = movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : "https://via.placeholder.com/500x750";
  const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : "";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  container.innerHTML = `
    <div class="details-page-inner" style="background-image: url('${backdrop}');">
      <div class="details-card">
        <div class="details-poster"><img src="${poster}" alt="${escapeHtml(movie.title)}"></div>
        <div class="details-info">
          <h1>${escapeHtml(movie.title)}</h1>
          <div class="meta-tags"><span class="rating">⭐ ${rating}</span></div>
          <p class="overview-text">${escapeHtml(movie.overview || "No overview available.")}</p>
          <button id="addBtn" class="btn btn-watchlist">+ Add to Watchlist</button>
        </div>
      </div>
    </div>
  `;

  const addBtn = document.getElementById("addBtn");
  if (addBtn) {
    addBtn.addEventListener("click", async () => {
      const success = await addItemToWatchlist(movie);
      if (success) {
        addBtn.textContent = "✓ In Your Watchlist";
        addBtn.disabled = true;
        addBtn.classList.add("btn-success");
      }
    });
  }

  if (isUserLoggedIn()) {
    isMovieInWatchlist(movie.id).then(inList => {
      if (inList && addBtn) {
        addBtn.textContent = "✓ In Your Watchlist";
        addBtn.disabled = true;
        addBtn.classList.add("btn-success");
      }
    }).catch(() => {});
  }
}

async function addItemToWatchlist(movie) {
  const user = getLoggedInUser();
  if (!user) {
    showAppMessage("Please login first to add movies to your watchlist!", "error");
    showView("login");
    syncUrl("login");
    return false;
  }

  try {
    if (await isMovieInWatchlist(movie.id)) {
      showAppMessage("This movie is already in your watchlist.", "info");
      return false;
    }

    const year = movie.release_date ? parseInt(movie.release_date.slice(0, 4), 10) : null;
    const payload = {
      title: (movie.title || "").trim(),
      imdb_id: normalizeStoredTmdbId(movie.id),
      year: Number.isNaN(year) ? null : year,
      poster_path: movie.poster_path || null,
      poster_url: movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : null,
      status: "want_to_watch",
      rating: null,
    };

    const validation = validateWatchlistMovieData(payload);
    if (!validation.valid) {
      showAppMessage(validation.message, "error");
      return false;
    }

    await movieApiFetch("/movies", {
      method: "POST",
      body: payload,
    });

    showAppMessage("Movie added to your watchlist!", "success");
    return true;
  } catch (error) {
    showAppMessage(error.message || "Failed to add movie to watchlist.", "error");
    return false;
  }
}

async function renderMovieReviews(movieId) {
  const reviewsSection = document.getElementById("reviewsSection");
  const reviewFormContainer = document.getElementById("reviewFormContainer");
  const reviewsList = document.getElementById("reviewsList");
  const user = getLoggedInUser();

  if (!reviewsSection) return;

  reviewsSection.style.display = "block";

  if (reviewFormContainer && user) {
    reviewFormContainer.style.display = "block";
  } else if (reviewFormContainer) {
    reviewFormContainer.style.display = "none";
  }

  if (!reviewsList) return;
  reviewsList.innerHTML = "<p class=\"movies-state\">Loading reviews…</p>";

  const reviews = await fetchMovieReviews(movieId);
  reviewsList.innerHTML = "";

  if (!Array.isArray(reviews) || reviews.length === 0) {
    reviewsList.innerHTML = "<p class=\"no-reviews\">No reviews yet. Be the first to review this movie!</p>";
    return;
  }

  reviews.forEach(review => {
    const reviewEl = document.createElement("div");
    reviewEl.className = "review-item";
    const date = new Date(review.created_at || review.updated_at || review.timestamp || Date.now()).toLocaleDateString();
    const reviewerName = (review.user && review.user.full_name) || review.user_name || review.userName || 'User';
    reviewEl.innerHTML = `
      <div class="review-header">
        <strong>${escapeHtml(reviewerName)}</strong>
        <span class="review-rating">★ ${review.rating}/10</span>
      </div>
      <p class="review-date">${date}</p>
      <p class="review-text">${escapeHtml(review.text)}</p>
    `;
    reviewsList.appendChild(reviewEl);
  });
}

function wireReviewForm(movieId) {
  const form = document.getElementById("reviewForm");
  const ratingSlider = document.getElementById("reviewRating");
  const ratingDisplay = document.getElementById("ratingDisplay");

  if (ratingSlider && ratingDisplay) {
    ratingSlider.addEventListener("input", () => {
      ratingDisplay.textContent = ratingSlider.value;
    });
  }

  if (form) {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const rating = parseInt(document.getElementById("reviewRating").value, 10);
      const text = document.getElementById("reviewText").value.trim();

      if (!text) {
        showAppMessage("Please write a review.", "error");
        return;
      }

      try {
        await saveMovieReview(movieId, { rating, text });
        showAppMessage("Review posted successfully!", "success");
        form.reset();
        if (ratingDisplay) ratingDisplay.textContent = "5";
        await renderMovieReviews(movieId);
      } catch (error) {
        showAppMessage(error.message || "Failed to submit review.", "error");
      }
    });
  }
}

function wireAuthForms() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);
  const signupForm = document.getElementById("signupForm");
  if (signupForm) signupForm.addEventListener("submit", handleSignupSubmit);
}

function initApp() {
  wireNavbarLinks();
  wireMobileMenu();
  wireAuthForms();
  updateNavbar();

  const { view, params } = parseHash();
  const options = {};

  if (view === "home") {
    if (params.has("genre")) options.genre = params.get("genre");
  }

  if (view === "details") {
    options.movieId = params.get("id");
  }

  showView(view, options);
}

window.addEventListener("hashchange", () => {
  const { view, params } = parseHash();
  const options = {};
  if (view === "home") {
    options.genre = params.get("genre") || "all";
  }
  if (view === "details") {
    options.movieId = params.get("id");
  }
  showView(view, options);
});

window.addEventListener("DOMContentLoaded", initApp);
