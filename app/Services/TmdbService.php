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

    public function request(string $path, array $params = []): Response
    {
        return Http::baseUrl($this->getBaseUrl())
            ->get($path, array_merge([
                'api_key' => $this->getApiKey(),
                'language' => 'en-US',
            ], $params));
    }
}
