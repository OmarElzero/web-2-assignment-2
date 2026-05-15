<nav class="navbar">
    <div class="container">
        <div class="navbar-content">
            <h1>
                <a href="#home" data-view="home" class="nav-link">Movie<span>Review</span></a>
            </h1>

            <ul id="navLinks">
                <li><a href="#home" data-view="home" class="nav-link active">Home</a></li>
                <li class="guest-only"><a href="#login" data-view="login" class="nav-link">Login</a></li>
                <li class="guest-only"><a href="#signup" data-view="signup" class="nav-link">Sign Up</a></li>
                <li class="user-only" style="display:none;"><span id="userGreeting" class="user-greeting">Hi, User</span></li>
                <li class="user-only" style="display:none;"><a href="#profile" data-view="profile" class="nav-link">My Profile</a></li>
                <li class="user-only" style="display:none;"><a href="#" id="logoutBtn" class="nav-link">Logout</a></li>
            </ul>

            <div class="bar-icon">☰</div>
        </div>
    </div>
</nav>
