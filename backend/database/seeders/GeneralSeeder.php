<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Marca;
use Illuminate\Database\Seeder;
use App\Models\Module;
use App\Models\Sede;
use App\Models\Subcategoria;
use App\Models\User;

class GeneralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Crear registros manualmente
        Sede::create([
            'direccion' => 'Alto Moche - Av San Jose XXX',
            'telefono' => '044-465505',
        ]);

        // Crear registros de marcas
        Marca::create([
            'marca' => 'Mobil',      // Nombre de la marca
            'estado' => true,        // Marca activa
        ]);

        Marca::create([
            'marca' => 'Castrol',    // Nombre de la marca
            'estado' => true,        // Marca activa
        ]);

        Marca::create([
            'marca' => 'Shell',      // Nombre de la marca
            'estado' => true,        // Marca activa
        ]);

        Marca::create([
            'marca' => 'Total',      // Nombre de la marca
            'estado' => true,        // Marca activa
        ]);

        Marca::create([
            'marca' => 'Petrobras',  // Nombre de la marca
            'estado' => false,       // Marca inactiva
        ]);

        // Crear registros de categorías
        Categoria::create([
            'categoria' => 'Lubricantes',    // Nombre de la categoría
            'estado' => true,                 // Categoría activa
        ]);

        Categoria::create([
            'categoria' => 'Ferretería',     // Nombre de la categoría
            'estado' => true,                 // Categoría activa
        ]);

        Categoria::create([
            'categoria' => 'Pinturas',       // Nombre de la categoría
            'estado' => true,                 // Categoría activa
        ]);

        Categoria::create([
            'categoria' => 'Herramientas',   // Nombre de la categoría
            'estado' => false,                // Categoría inactiva
        ]);

        // Crear registros de subcategorías para cada categoría
        Subcategoria::create([
            'subcategoria' => 'Aceite de Motor',  // Nombre de la subcategoría
            'idCategoria' => 1,                   // ID de la categoría asociada
            'estado' => true,                     // Subcategoría activa
        ]);

        Subcategoria::create([
            'subcategoria' => 'Aceite para Transmisión', // Nombre de la subcategoría
            'idCategoria' => 1,                       // ID de la categoría asociada
            'estado' => true,                         // Subcategoría activa
        ]);

        Subcategoria::create([
            'subcategoria' => 'Cinta Aislante',         // Nombre de la subcategoría
            'idCategoria' => 2,                         // ID de la categoría asociada
            'estado' => true,                           // Subcategoría activa
        ]);

        Subcategoria::create([
            'subcategoria' => 'Martillos',              // Nombre de la subcategoría
            'idCategoria' => 2,                         // ID de la categoría asociada
            'estado' => false,                          // Subcategoría inactiva
        ]);

        Subcategoria::create([
            'subcategoria' => 'Pintura Automotriz',     // Nombre de la subcategoría
            'idCategoria' => 3,                         // ID de la categoría asociada
            'estado' => true,                           // Subcategoría activa
        ]);

    

    }
}
