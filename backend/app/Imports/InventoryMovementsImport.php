<?php


namespace App\Imports;

use App\Models\Inventario;
use App\Models\MovInventario;
use App\Models\Producto;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class InventoryMovementsImport implements ToModel, WithHeadingRow
{
    public $errors = []; // Guardará los errores

    public function model(array $row)
    {
        if (empty(array_filter($row))) {
            return null; 
        }

        return DB::transaction(function () use ($row) {
            try {
                $validator = Validator::make($row, [
                    'codigo' => 'required|string|exists:producto,codigo',
                    'cantidad' => 'required|integer|min:1',
                    'tipo' => 'required|string|in:Entrada,Salida',
                    'descripcion' => 'nullable|string|max:255'
                ], [
                    'codigo.required' => 'El campo código del producto es obligatorio.',
                    'codigo.string' => 'El código del producto debe ser una cadena de texto.',
                    'codigo.exists' => "El producto con código '{$row['codigo']}' no existe en la base de datos.",
                    
                    'cantidad.required' => 'El campo cantidad es obligatorio.',
                    'cantidad.integer' => 'La cantidad debe ser un número entero.',
                    'cantidad.min' => 'La cantidad debe ser al menos 1.',
        
                    'tipo.required' => 'El campo tipo de movimiento es obligatorio.',
                    'tipo.string' => 'El tipo de movimiento debe ser una cadena de texto.',
                    'tipo.in' => "El tipo de movimiento debe ser 'Ingreso' o 'Egreso'.",
        
                    'descripcion.string' => 'La descripción debe ser una cadena de texto.',
                    'descripcion.max' => 'La descripción no puede tener más de 255 caracteres.'
                ]);
        
                if ($validator->fails()) {
                    throw new \Exception(implode(', ', $validator->errors()->all()));
                }

                $producto = Producto::where('codigo', $row['codigo'])->first();
                $inventario = Inventario::where('idProducto', $producto->idProducto)->first();

                if (!$inventario) {
                    throw new \Exception("No hay inventario registrado para el producto '{$row['codigo']}'.");
                }

                if ($row['tipo'] === 'Entrada') {
                    $inventario->stockActual += $row['cantidad'];
                } else {
                    if ($inventario->stockActual < $row['cantidad']) {
                        throw new \Exception("Stock insuficiente para la salida del producto '{$row['codigo']}'.");
                    }
                    $inventario->stockActual -= $row['cantidad'];
                }

                $inventario->save();

                return MovInventario::create([
                    'idProducto' => $producto->idProducto,
                    'tipo' => $row['tipo'], 
                    'cantidad' => $row['cantidad'],
                    'stockRestante' => $inventario->stockActual,
                    'descripcion' => $row['descripcion'] ?? 'Actualizacion por import desde Excel',
                    'idInventario' => $inventario->idInventario,
                    'fecha' => now()->format('Y-m-d H:i:s')
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                $this->errors[] = [
                    'row' => $row,
                    'error' => $e->getMessage()
                ];
                return null;
            }
        });
    }
}
