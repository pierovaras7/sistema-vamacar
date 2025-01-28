<?php

namespace App\Http\Controllers;

use App\Imports\InventoryMovementsImport;
use App\Models\Inventario;
use App\Models\MovInventario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class InventarioController extends Controller
{
    public function index()
{
    $inventarios = Inventario::with(['producto',
        'movsInventario' => function ($query) {
            $query->orderBy('fecha', 'desc'); // Ordenar los detalles por fecha descendente
        },
     ])->get();
    return response()->json($inventarios, 200);
}
    

    public function import(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|mimes:xlsx,csv',
            ], [
                'file.mimes' => 'El archivo debe ser de formato .xlsx o .csv.', // Corregido aquí
            ]);

            $import = new InventoryMovementsImport();
            Excel::import($import, $request->file('file'));

            return response()->json([
                'message' => 'Importación completada.',
                'errors' => $import->errors,
            ], empty($import->errors) ? 200 : 206);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al importar productos.', 'error' => $e->getMessage()], 500);
        }
    }



    public function registrarMovInventario(Request $request, $idInventario)
    {
        // Buscar el inventario por su ID
        $inventario = Inventario::find($idInventario);

        if (!$inventario) {
            return response()->json(['error' => 'Inventario no encontrado'], 404);
        }

        // Validar los datos del request
        $validatedData = $request->validate([
            'tipo' => 'required|string|in:Entrada,Salida', // El tipo debe ser 'Ingreso' o 'Egreso'
            'descripcion' => 'required|string',
            'cantidad' => 'required|numeric|gt:0', // La cantidad debe ser mayor a 0
            'fecha' => 'required|date', // Valida que sea una fecha válida
        ]);

        $tipo = $validatedData['tipo'];
        $descripcion = $validatedData['descripcion'];
        $cantidad = $validatedData['cantidad'];
        $fecha = Carbon::parse($validatedData['fecha'])->format('Y-m-d H:i:s'); // Formato MySQL compatible

        // Calcular la nueva cantidad de stock según el tipo de movimiento
        if ($tipo === 'Salida') {
            if ($cantidad > $inventario->stockActual) {
            return response()->json([
                    'error' => 'La cantidad de egreso no puede ser mayor que el stock actual.'
                ], 400);
            }
            $inventario->stockActual -= $cantidad; // Restar la cantidad al stock
        } elseif ($tipo === 'Entrada') {
            $inventario->stockActual += $cantidad; // Sumar la cantidad al stock
        }

        // Guardar los cambios en el inventario
        $inventario->save();

        // Crear un nuevo detalle asociado al inventario
        $detalle = MovInventario::create([
            'idInventario' => $idInventario, // Asociar el detalle con el inventario
            'tipo' => $tipo,
            'descripcion' => $descripcion,
            'cantidad' => $cantidad,
            'stockRestante' => $inventario->stockActual,
            'fecha' => $fecha,
        ]);

        return response()->json(['message' => 'Movimiento registrado correctamente', 'detalle' => $detalle], 201);
    }

    
    
}
