<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\MovInventario;
use Carbon\Carbon;
use Illuminate\Http\Request;


class InventarioController extends Controller
{
    public function index()
{
    $inventarios = Inventario::with(['producto', 'movsInventario'])->get();
    return response()->json($inventarios, 200);
}
    

    // public function store(Request $request)
    // {
    //     $idCliente = $request->input('cliente.idCliente');

    //     $CC = CuentaPorCobrar::where("idCliente","=",$idCliente)->first();

    //     if($CC){
    //         return response()->json(['error' => 'El cliente ya esta asociado a una cuenta por cobrar.'], 404);
        
    //     }

    //     $newCuenta = CuentaPorCobrar::create([
    //         'idCliente' => $idCliente, // Asociar el detalle con la cuenta por cobrar
    //         'montoCuenta' => 0,
    //     ]);

    //     DetalleCC::create([
    //         'motivo' => $request->input('motivo'), // Asociar el detalle con la cuenta por cobrar
    //         'fecha' =>  Carbon::parse(Date::now())->format('Y-m-d H:i:s'),
    //         'monto' => $request->input('montoCuenta'),
    //         'saldo' => $request->input('montoCuenta'),
    //         'idCC' => $newCuenta->idCC,
    //     ]);

    //     $newCuenta->montoCuenta = $request->input('montoCuenta');
    //     $newCuenta->save();
        
    //     return response()->json(['message' => 'Cuenta por cobrar registrada correctamente',$newCuenta], 200);
    // }



    public function registrarMovInventario(Request $request, $idInventario)
    {
        // Buscar el inventario por su ID
        $inventario = Inventario::find($idInventario);

        if (!$inventario) {
            return response()->json(['error' => 'Inventario no encontrado'], 404);
        }

        // Validar los datos del request
        $validatedData = $request->validate([
            'tipo' => 'required|string|in:Ingreso,Egreso', // El tipo debe ser 'Ingreso' o 'Egreso'
            'descripcion' => 'required|string',
            'cantidad' => 'required|numeric|gt:0', // La cantidad debe ser mayor a 0
            'fecha' => 'required|date', // Valida que sea una fecha válida
        ]);

        $tipo = $validatedData['tipo'];
        $descripcion = $validatedData['descripcion'];
        $cantidad = $validatedData['cantidad'];
        $fecha = Carbon::parse($validatedData['fecha'])->format('Y-m-d H:i:s'); // Formato MySQL compatible

        // Calcular la nueva cantidad de stock según el tipo de movimiento
        if ($tipo === 'Egreso') {
            if ($cantidad > $inventario->stockActual) {
            return response()->json([
                    'error' => 'La cantidad de egreso no puede ser mayor que el stock actual.'
                ], 400);
            }
            $inventario->stockActual -= $cantidad; // Restar la cantidad al stock
        } elseif ($tipo === 'Ingreso') {
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
            'fecha' => $fecha,
        ]);

        return response()->json(['message' => 'Movimiento registrado correctamente', 'detalle' => $detalle], 201);
    }

    
    
}
