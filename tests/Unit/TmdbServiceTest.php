<?php

namespace Tests\Unit;

use App\Services\TmdbService;
use Tests\TestCase;

class TmdbServiceTest extends TestCase
{
    public function test_reports_not_configured_when_api_key_missing(): void
    {
        config(['services.tmdb.key' => null]);

        $service = new TmdbService();

        $this->assertFalse($service->isConfigured());
        $this->assertNull($service->getApiKey());
    }

    public function test_reads_api_key_from_config(): void
    {
        config(['services.tmdb.key' => 'test-key-123']);

        $service = new TmdbService();

        $this->assertTrue($service->isConfigured());
        $this->assertSame('test-key-123', $service->getApiKey());
    }
}
