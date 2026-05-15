<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class TmdbService
{
    public function getApiKey(): ?string
    {
        return config('services.tmdb.key');
    }

    public function getBaseUrl(): string
    {
        return config('services.tmdb.base_url', 'https://api.themoviedb.org/3');
    }

    public function isConfigured(): bool
    {
        return ! empty($this->getApiKey());
    }

    public function usesBearerToken(): bool
    {
        $key = $this->getApiKey();

        return is_string($key) && str_contains($key, '.');
    }

    public function request(string $path, array $params = []): Response
    {
        $params = array_merge(['language' => 'en-US'], $params);
        $client = Http::baseUrl($this->getBaseUrl());

        if ($this->usesBearerToken()) {
            return $client
                ->withToken($this->getApiKey())
                ->get($path, $params);
        }

        return $client->get($path, array_merge([
            'api_key' => $this->getApiKey(),
        ], $params));
    }
}
