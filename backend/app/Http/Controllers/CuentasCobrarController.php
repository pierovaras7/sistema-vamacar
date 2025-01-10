<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\CuentaPorCobrar;
use App\Models\DetalleCC;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Validator;

class CuentasCobrarController extends Controller
{
    public function index()
{
    $cuentas = CuentaPorCobrar::with(['detalles', 'cliente' => function ($query) {
        $query->with(['natural', 'juridico']); // Cargar las relaciones 'natural' y 'juridico'
    }])
    ->leftJoin('detalles_cc as dcc', 'cuentas_por_cobrar.idCC', '=', 'dcc.idCC') // Relacionar detalles
    ->select('cuentas_por_cobrar.*', DB::raw('MAX(dcc.fecha) as max_fecha')) // Seleccionar la fecha más reciente
    ->groupBy('cuentas_por_cobrar.idCC') // Agrupar por la cuenta
    ->orderBy('max_fecha', 'desc') // Ordenar por la fecha más reciente
    ->get();

    return response()->json($cuentas, 200);
}
    

    public function store(Request $request)
    {
        $idCliente = $request->input('cliente.idCliente');

        $CC = CuentaPorCobrar::where("idCliente","=",$idCliente)->first();

        if($CC){
            return response()->json(['error' => 'El cliente ya esta asociado a una cuenta por cobrar.'], 404);
        
        }

        $newCuenta = CuentaPorCobrar::create([
            'idCliente' => $idCliente, // Asociar el detalle con la cuenta por cobrar
            'montoCuenta' => 0,
        ]);

        DetalleCC::create([
            'motivo' => $request->input('motivo'), // Asociar el detalle con la cuenta por cobrar
            'fecha' =>  Carbon::parse(Date::now())->format('Y-m-d H:i:s'),
            'monto' => $request->input('montoCuenta'),
            'saldo' => $request->input('montoCuenta'),
            'idCC' => $newCuenta->idCC,
        ]);

        $newCuenta->montoCuenta = $request->input('montoCuenta');
        $newCuenta->save();
        
        return response()->json(['message' => 'Cuenta por cobrar registrada correctamente',$newCuenta], 200);
    }



    public function registrarDetalleCC(Request $request, $idCC) 
    {
        // Encontrar la cuenta por cobrar por su ID
        $CC = CuentaPorCobrar::find($idCC);

        if (!$CC) {
            return response()->json(['error' => 'Cuenta por cobrar no encontrada'], 404);
        }

        // Validar los datos del request
        $validatedData = $request->validate([
            'motivo' => 'required|string',
            'monto' => 'required|numeric|gt:0', // Asegura que sea un número mayor a 0
            'fecha' => 'required|date', // Valida que sea una fecha válida
        ]);

        $motivo = $validatedData['motivo'];
        $monto = $validatedData['monto'];
        $fecha = Carbon::parse($validatedData['fecha'])->format('Y-m-d H:i:s'); // Formato MySQL compatible

        // Calcular el nuevo saldo según el motivo
        $nuevoSaldo = $CC->montoCuenta;

        if ($motivo === 'Amortizacion') {
            if ($monto > $CC->montoCuenta) {
                // Validar que el monto de amortización no exceda el saldo
                return response()->json([
                    'error' => 'El monto de la amortización no puede ser mayor que el saldo de la cuenta.'
                ], 400);
            }

            $nuevoSaldo -= $monto; // Restar el monto en caso de amortización
            $CC->montoCuenta -= $monto; // Actualizar el monto de la cuenta
        } elseif ($motivo === 'Prestamo') {
            $nuevoSaldo += $monto; // Sumar el monto en caso de préstamo
            $CC->montoCuenta += $monto; // Actualizar el monto de la cuenta
        }

        // Guardar los cambios en la cuenta por cobrar
        $CC->save();

        // Crear un nuevo detalle asociado a la cuenta por cobrar
        $detalle = DetalleCC::create([
            'idCC' => $idCC, // Asociar el detalle con la cuenta por cobrar
            'fecha' => $fecha,
            'motivo' => $motivo,
            'monto' => $monto,
            'saldo' => $nuevoSaldo, // Registrar el saldo actualizado en el detalle
        ]);

        return response()->json(['message' => 'Detalle registrado correctamente', 'detalle' => $detalle], 201);
    }

    
    
    

    // public function store(Request $request) 
    // {
    //     $request->validate([
    //         'marca' => 'required|string|max:255',
    //     ]);

    //     $existingMarca = Marca::where('marca', $request->input('marca'))->first();

    //     if ($existingMarca) {
    //         if ($existingMarca->estado == false) {
    //             $existingMarca->estado = true;
    //             $existingMarca->save();

    //             return response()->json([
    //                 'message' => 'Marca reactivada exitosamente.',
    //                 'marca' => $existingMarca,
    //             ], 200);
    //         } else {
    //             return response()->json(['message' => 'La marca ya está creada y activa.'], 400);
    //         }
    //     }

    //     $marca = Marca::create([
    //         'marca' => $request->input('marca'),
    //         'estado' => true, 
    //     ]);

    //     return response()->json([
    //         'message' => 'Marca creada exitosamente.',
    //         'marca' => $marca,
    //     ], 201);
    // }

    


    // public function show($id)
    // {
    //     $marca = Marca::find($id);

    //     if (!$marca) {
    //         return response()->json(['message' => 'Marca no encontrada.'], 404);
    //     }

    //     return response()->json($marca, 200);
    // }


    // public function update(Request $request, $id)
    // {
    //     $marca = Marca::find($id);

    //     if (!$marca) {
    //         return response()->json(['message' => 'Marca no encontrada.'], 404);
    //     }

    //     $request->validate([
    //         'marca' => 'sometimes|required|string|max:255',
    //         'estado' => 'sometimes|required|boolean',
    //     ]);

    //     $marca->update($request->all());

    //     return response()->json([
    //         'message' => 'Marca actualizada exitosamente.',
    //         'marca' => $marca,
    //     ], 200);
    // }


    // public function destroy($id)
    // {
    //     $marca = Marca::find($id);

    //     if (!$marca) {
    //         return response()->json(['message' => 'Marca no encontrada.'], 404);
    //     }

    //     $marca->estado = false;
    //     $marca->save();

    //     return response()->json(['message' => 'Marca eliminada exitosamente.'], 200);
    // }
}
