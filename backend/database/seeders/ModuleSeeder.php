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
            'name' => 'Marcas',
            'slug' => '/marcas',
            'icon' => 'marcas',
        ]); 

        Module::create([
            'name' => 'Categorias',
            'slug' => '/categorias',
            'icon' => 'categorias',
        ]);

        Module::create([
            'name' => 'Productos',
            'slug' => '/productos',
            'icon' => 'productos',
        ]);

        Module::create([
            'name' => 'Clientes',
            'slug' => '/clientes',
            'icon' => 'clientes',
        ]);

        Module::create([
            'name' => 'Ventas',
            'slug' => '/ventas',
            'icon' => 'ventas',
        ]);

        Module::create([
            'name' => 'Cuentas por Cobrar',
            'slug' => '/cuentasxcobrar',
            'icon' => 'cobrar',
        ]);

        Module::create([
            'name' => 'Proveedores',
            'slug' => '/proveedores',
            'icon' => 'proveedores',
        ]);

        Module::create([
            'name' => 'Compras',
            'slug' => '/compras',
            'icon' => 'compras',
        ]);


        Module::create([
            'name' => 'Cuentas por Pagar',
            'slug' => '/cuentasxpagar',
            'icon' => 'pagar',
        ]);

        Module::create([
            'name' => 'Inventarios',
            'slug' => '/inventarios',
            'icon' => 'inventarios',
        ]);

        Module::create([
            'name' => 'Trabajadores',
            'slug' => '/trabajadores',
            'icon' => 'trabajadores',
        ]);

        Module::create([
            'name' => 'Usuarios',
            'slug' => '/users',
            'icon' => 'usuarios',
        ]);

    }
}
