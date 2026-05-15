<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        if (User::where('email', 'admin@example.test')->exists()) {
            $this->command->info('Admin user already exists, skipping.');
            return;
        }

        User::create([
            'full_name' => 'Admin User',
            'email' => 'admin@example.test',
            'password_hash' => Hash::make('secret123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->command->info('Admin user created: admin@example.test / secret123');
    }
}
