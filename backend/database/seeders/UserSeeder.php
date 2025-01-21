<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Crear registros manualmente
        User::create([
            'name' => 'Administrador',
            'username' => 'admin',
            'password' => 'admin123',
            'isAdmin' => true,
        ]);

        User::create([
            'name' => 'Iris Varas',
            'username' => 'irisvaras',
            'password' => 'irisvaras',
            "isAdmin" => true,
        ]);

    }
}
