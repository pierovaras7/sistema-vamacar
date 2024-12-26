<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Crear registros manualmente
        Module::create([
            'name' => 'Trabajadores',
            'slug' => '/trabajadores',
        ]);

        Module::create([
            'name' => 'Usuarios',
            'slug' => '/users',
        ]);

        Module::create([
            'name' => 'Marcas',
            'slug' => '/marcas',
        ]);

        Module::create([
            'name' => 'Categorias',
            'slug' => '/categorias',
        ]);

        Module::create([
            'name' => 'Productos',
            'slug' => '/productos',
        ]);

    }
}
