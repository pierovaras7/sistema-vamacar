<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Subcategoria;
use App\Models\Marca;
use Faker\Factory as Faker;

class ProductoSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Obtener las categorías y marcas existentes
        $subcategorias = Subcategoria::pluck('idSubcategoria')->toArray();
        $marcas = Marca::pluck('idMarca')->toArray();

        // Crear 50 productos
        foreach (range(1, 50) as $index) {
            Producto::create([
                'descripcion' => $faker->sentence(3),          // Descripción del producto
                'codigo' => strtoupper($faker->lexify('???-####')), // Código del producto
                'uni_medida' => $faker->randomElement(['kg', 'litro', 'unidad']), // Unidad de medida
                'precioCosto' => $faker->randomFloat(2, 1, 100),  // Precio de costo (entre 1 y 100)
                'precioMinVenta' => $faker->randomFloat(2, 10, 200), // Precio mínimo de venta
                'precioMaxVenta' => $faker->randomFloat(2, 100, 500), // Precio máximo de venta
                'precioXMayor' => $faker->randomFloat(2, 50, 150), // Precio por mayor
                'idSubcategoria' => $faker->randomElement($subcategorias), // Subcategoría asociada
                'idMarca' => $faker->randomElement($marcas), // Marca asociada
            ]);
        }
    }
}
