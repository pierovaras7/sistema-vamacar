<?php

namespace Database\Seeders;

use App\Models\Inventario;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(TrabajadorSeeder::class);
        $this->call(ModuleSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(GeneralSeeder::class);
        $this->call(ProductoSeeder::class);
        $this->call(InventarioSeeder::class);
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
