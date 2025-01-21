<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;

class ProductoSeeder extends Seeder
{
    public function run()
    {
        $productos = [
            [
                'descripcion' => 'Aceite de motor Mobil 5W-30',
                'codigo' => 'MOB-001',
                'uni_medida' => 'litro',
                'precioCosto' => 20.50,
                'precioMinVenta' => 25.00,
                'precioMaxVenta' => 30.00,
                'precioXMayor' => 22.00,
                'ubicacion' => 'S2-B',
                'idSubcategoria' => 1, // Aceite de Motor
                'idMarca' => 1,        // Mobil
            ],
            [
                'descripcion' => 'Aceite para transmisión Castrol Dexron III',
                'codigo' => 'CAS-001',
                'uni_medida' => 'litro',
                'precioCosto' => 18.00,
                'precioMinVenta' => 22.00,
                'precioMaxVenta' => 28.00,
                'precioXMayor' => 20.00,
                'ubicacion' => 'S2-B',
                'idSubcategoria' => 2, // Aceite para Transmisión
                'idMarca' => 2,        // Castrol
            ],
            [
                'descripcion' => 'Aceite de motor Shell 10W-40',
                'codigo' => 'SHE-001',
                'uni_medida' => 'litro',
                'precioCosto' => 22.00,
                'precioMinVenta' => 27.00,
                'precioMaxVenta' => 33.00,
                'precioXMayor' => 24.00,
                'ubicacion' => 'S2-B',
                'idSubcategoria' => 1, // Aceite de Motor
                'idMarca' => 3,        // Shell
            ],
            [
                'descripcion' => 'Aceite Total Quartz 5W-30',
                'codigo' => 'TOT-001',
                'uni_medida' => 'litro',
                'precioCosto' => 19.00,
                'precioMinVenta' => 23.00,
                'precioMaxVenta' => 29.00,
                'precioXMayor' => 21.00,
                'ubicacion' => 'S2-B',
                'idSubcategoria' => 1, // Aceite de Motor
                'idMarca' => 4,        // Total
            ],
            [
                'descripcion' => 'Aceite de motor Petrobras Multigrade 15W-40',
                'codigo' => 'PET-001',
                'uni_medida' => 'litro',
                'precioCosto' => 15.00,
                'precioMinVenta' => 18.00,
                'precioMaxVenta' => 25.00,
                'precioXMayor' => 16.50,
                'ubicacion' => 'S2-B',
                'idSubcategoria' => 1, // Aceite de Motor
                'idMarca' => 5,        // Petrobras
            ],
            [
                'descripcion' => 'Cinta aislante negra 3M',
                'codigo' => 'CIN-001',
                'uni_medida' => 'unidad',
                'precioCosto' => 2.00,
                'precioMinVenta' => 3.00,
                'precioMaxVenta' => 4.00,
                'precioXMayor' => 2.50,
                'ubicacion' => 'S2-B',
                'idSubcategoria' => 3, // Cinta Aislante
                'idMarca' => 1,        // Mobil (como ejemplo genérico)
            ],
            [
                'descripcion' => 'Pintura automotriz roja brillante',
                'codigo' => 'PIN-001',
                'uni_medida' => 'litro',
                'precioCosto' => 30.00,
                'precioMinVenta' => 35.00,
                'precioMaxVenta' => 45.00,
                'precioXMayor' => 32.00,
                'ubicacion' => 'S2-B',
                'idSubcategoria' => 5, // Pintura Automotriz
                'idMarca' => 3,        // Shell (como ejemplo genérico)
            ],
        ];

        foreach ($productos as $producto) {
            Producto::create($producto);
        }
    }
}
