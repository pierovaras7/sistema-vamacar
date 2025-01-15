<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventario;

class InventarioSeeder extends Seeder
{
    public function run()
    {
        $inventarios = [
            [
                'stockMinimo' => 10,
                'stockActual' => 50,
                'idProducto' => 1,
                'estado' => true,
            ],
            [
                'stockMinimo' => 15,
                'stockActual' => 30,
                'idProducto' => 2,
                'estado' => true,
            ],
            [
                'stockMinimo' => 10,
                'stockActual' => 40,
                'idProducto' => 3,
                'estado' => true,
            ],
            [
                'stockMinimo' => 8,
                'stockActual' => 25,
                'idProducto' => 4,
                'estado' => true,
            ],
            [
                'stockMinimo' => 5,
                'stockActual' => 20,
                'idProducto' => 5,
                'estado' => true,
            ],
            [
                'stockMinimo' => 50,
                'stockActual' => 200,
                'idProducto' => 6,
                'estado' => true,
            ],
            [
                'stockMinimo' => 5,
                'stockActual' => 15,
                'idProducto' => 7,
                'estado' => true,
            ],
        ];

        foreach ($inventarios as $inventario) {
            Inventario::create($inventario);
        }
    }
}
