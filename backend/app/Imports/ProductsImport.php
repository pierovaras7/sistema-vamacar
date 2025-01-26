<?php

namespace App\Imports;

use App\Models\Inventario;
use App\Models\Marca;
use App\Models\Producto;
use App\Models\Subcategoria;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductsImport implements SkipsOnFailure, ToModel, WithHeadingRow
{
    use SkipsFailures;

    public $errors = []; // Guardará las filas con errores



    public function model(array $row)
{
    // Verifica si la fila está vacía
    if (empty(array_filter($row))) {
        return null; // Si la fila está vacía, no la procesa
    }

    try {
        // Validar que los campos de subcategoría y marca estén presentes antes de buscar
        $validator = Validator::make($row, [
            'codigo' => 'required|string|max:255',
            'descripcion' => 'required|string|max:255',
            'uni_medida' => 'required|string|max:50',
            'preciocosto' => 'required|numeric',
            'preciominventa' => 'required|numeric',
            'preciomaxventa' => 'required|numeric',
            'precioxmayor' => 'required|numeric',
            'ubicacion' => 'nullable|string|max:255',
            'subcategoria' => 'required|string|max:255', // Ahora es requerido
            'marca' => 'required|string|max:255', // Ahora es requerido
            'stockminimo' => 'required|numeric',
            'stockinicial' => 'required|numeric',
        ], [
            'codigo.required' => 'El campo código es obligatorio.',
            'codigo.string' => 'El código debe ser una cadena de texto.',
            'codigo.max' => 'El código no puede tener más de 255 caracteres.',
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string' => 'La descripción debe ser una cadena de texto.',
            'descripcion.max' => 'La descripción no puede tener más de 255 caracteres.',
            'uni_medida.required' => 'El campo unidad de medida es obligatorio.',
            'uni_medida.string' => 'La unidad de medida debe ser una cadena de texto.',
            'uni_medida.max' => 'La unidad de medida no puede tener más de 50 caracteres.',
            'preciocosto.required' => 'El campo precio de costo es obligatorio.',
            'preciocosto.numeric' => 'El precio de costo debe ser un número.',
            'preciominventa.required' => 'El campo precio mínimo de venta es obligatorio.',
            'preciominventa.numeric' => 'El precio mínimo de venta debe ser un número.',
            'preciomaxventa.required' => 'El campo precio máximo de venta es obligatorio.',
            'preciomaxventa.numeric' => 'El precio máximo de venta debe ser un número.',
            'precioxmayor.required' => 'El campo precio por mayor es obligatorio.',
            'precioxmayor.numeric' => 'El precio por mayor debe ser un número.',
            'ubicacion.nullable' => 'El campo ubicación es opcional.',
            'ubicacion.string' => 'La ubicación debe ser una cadena de texto.',
            'ubicacion.max' => 'La ubicación no puede tener más de 255 caracteres.',
            'subcategoria.required' => 'El campo subcategoría es obligatorio.',
            'subcategoria.string' => 'La subcategoria debe ser una cadena de texto.',
            'marca.required' => 'El campo marca es obligatorio.',
            'marca.string' => 'La marca debe ser una cadena de texto.',
            'stockminimo.required' => 'El campo stock mínimo es obligatorio.',
            'stockminimo.numeric' => 'El stock mínimo debe ser un número.',
            'stockinicial.required' => 'El campo stock inicial es obligatorio.',
            'stockinicial.numeric' => 'El stock inicial debe ser un número.',
        ]);

        if ($validator->fails()) {
            $this->errors[] = [
                'row' => $row,
                'error' => $validator->errors()->all()
            ];
            return null;
        }

        // Buscar la subcategoría por nombre
        $subcategoria = Subcategoria::where('subcategoria', $row['subcategoria'])->first();
        if (!$subcategoria) {
            $this->errors[] = [
                'row' => $row,
                'error' => "La subcategoría '{$row['subcategoria']}' no existe."
            ];
            return null;
        }

        // Buscar la marca por nombre
        $marca = Marca::where('marca', $row['marca'])->first();
        if (!$marca) {
            $this->errors[] = [
                'row' => $row,
                'error' => "La marca '{$row['marca']}' no existe."
            ];
            return null;
        }

        // Buscar si el producto ya existe
        $productoExistente = Producto::where('codigo', $row['codigo'])->first();

        if ($productoExistente) {

            $productoExistente->update([
                'descripcion' => $row['descripcion'],
                'uni_medida' => $row['uni_medida'],
                'precioCosto' => $row['preciocosto'],
                'precioMinVenta' => $row['preciominventa'],
                'precioMaxVenta' => $row['preciomaxventa'],
                'precioXMayor' => $row['precioxmayor'],
                'ubicacion' => $row['ubicacion'] ?? null,
                'idSubcategoria' => $subcategoria->idSubcategoria,
                'idMarca' => $marca->idMarca,
                'estado' => true,
            ]);

            $inventario = Inventario::where("idProducto", "=", $productoExistente->idProducto)->first();
            $inventario->stockMinimo = $row['stockminimo'];
            $inventario->save();

            return $productoExistente;
        }

        // Crear el nuevo producto
        $producto = Producto::create([
            'descripcion' => $row['descripcion'],
            'codigo' => $row['codigo'],
            'uni_medida' => $row['uni_medida'],
            'precioCosto' => $row['preciocosto'],
            'precioMinVenta' => $row['preciominventa'],
            'precioMaxVenta' => $row['preciomaxventa'],
            'precioXMayor' => $row['precioxmayor'],
            'ubicacion' => $row['ubicacion'] ?? null,
            'idSubcategoria' => $subcategoria->idSubcategoria,
            'idMarca' => $marca->idMarca,
            'estado' => true,
        ]);

        // Agregarlo al inventario
        Inventario::create([
            'idProducto' => $producto->idProducto,
            'stockMinimo' => $row['stockminimo'],
            'stockActual' => $row['stockinicial'],
        ]);

        return $producto;

    } catch (\Exception $e) {
        // Agregar error si ocurre una excepción
        $this->errors[] = [
            'row' => $row,
            'error' => $e->getMessage()
        ];
        return null;
    }
}

}

