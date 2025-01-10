<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\Trabajador;
use App\Models\Sede;
use App\Models\Cliente;
use App\Models\CuentaPorCobrar;
use App\Models\DetalleCC;
use App\Models\DetalleVenta;
use App\Models\Inventario;
use App\Models\MovInventario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class VentaController extends Controller
{
    // Mostrar todos las ventas
    public function index()
    {
        $ventas = Venta::with(['trabajador', 'sede', 'cliente' => function ($query) {
            $query->with(['natural', 'juridico']); // Cargar las relaciones 'natural' y 'juridico'
        }])->get();
        
        return response()->json($ventas);
    }


    // Mostrar una venta específica
    public function show($id)
    {
        try {
            $venta = Venta::with(['trabajador', 'sede', 'cliente'])->findOrFail($id);
            return response()->json($venta);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }
    }

    public function store(Request $request)
    {
        // Validar los datos de la venta y los detalles
        $validator = Validator::make($request->all(), [
            'fecha' => 'required|date',
            'total' => 'numeric|required',
            'montoPagado' => 'nullable|numeric',
            'tipoVenta' => 'required|in:contado,credito',
            'metodoPago' => 'required|in:efectivo,tarjeta,yape,plin',
            'estado' => 'boolean',
            'cliente' => 'required',
            'detalles' => 'required|array',
            'detalles.*.producto.idProducto' => 'required|exists:producto,idProducto', // Validación del producto
            'detalles.*.precio' => 'required|numeric|min:0',
            'detalles.*.cantidad' => 'required|numeric|min:1',
            'detalles.*.subtotal' => 'required|numeric|min:0', // Validación del subtotal
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Inicializar un array con los campos básicos de la venta
        $ventaData = $request->only([
            'fecha', 'total', 'tipoVenta', 'metodoPago', 'estado'
        ]);

        $ventaData['idCliente'] = $request->input('cliente')['idCliente']; // Agregar idSede al array

        // Verificar si el campo 'sede' está presente en la solicitud y agregarlo al array
        if ($request->has('sede')) {
            $ventaData['idSede'] = $request->input('sede')['idSede']; // Agregar idSede al array
        }

        // Si el tipo de venta es "contado", agregar montoPagado al array
        if ($request->input('tipoVenta') == "contado") {
            $ventaData['montoPagado'] = $request->input('total'); // Asignar montoPagado
        } else{
            $ventaData['montoPagado'] = $request->input('montoPagado'); // Asignar montoPagado
            $ventaData['estado'] = 0; 
        }

        // Crear la venta con todos los datos de $ventaData
        $venta = Venta::create($ventaData);



        // Crear los detalles de la venta
        $detallesData = $request->input('detalles');

        foreach ($detallesData as $detalle) {
            DetalleVenta::create([
                'idVenta' => $venta->idVenta,
                'idProducto' => $detalle['producto']['idProducto'], // Extraer el idProducto del objeto producto
                'precio' => $detalle['precio'],
                'cantidad' => $detalle['cantidad'],
                'subtotal' => $detalle['subtotal'],
            ]);

            $invProd = Inventario::where('idProducto', $detalle['producto']['idProducto'])->first();

            if($invProd){
                MovInventario::create([
                    'tipo' => 'Salida',
                    'descripcion' => 'Venta Realizada',
                    'fecha' => $venta->fecha,
                    'cantidad' => $detalle['cantidad'],
                    'idInventario' => $invProd->idInventario
                ]);
            }
        }

        $clienteId = $request->input('cliente.idCliente');

        // Solo crear la cuenta por cobrar si la venta es a crédito
        if ($request->input('tipoVenta') == 'credito') {
            // Buscar la cuenta por cobrar del cliente, si existe
            $cuentaPorCobrar = CuentaPorCobrar::where('idCliente', $clienteId)->first();

            if (!$cuentaPorCobrar) {
                // Si no existe, crear una nueva cuenta por cobrar
                $cuentaPorCobrar = CuentaPorCobrar::create([
                    'idCliente' => $clienteId,
                    'montoCuenta' => 0, // Inicialmente el monto es 0
                ]);
            }

            // Calcular la diferencia entre el total y el monto pagado
            $montoDetalle = $request->input('total') - $request->input('montoPagado');

            // Crear un detalle para la cuenta por cobrar con el monto de la venta a crédito
            DetalleCC::create([
                'idCC' => $cuentaPorCobrar->idCC, // Asociar el detalle con la cuenta por cobrar
                'fecha' => $request->input('fecha'),
                'motivo' => 'Venta',
                'monto' => $montoDetalle, // La diferencia entre total y monto pagado
                'saldo' => $cuentaPorCobrar->montoCuenta + $montoDetalle
            ]);

            $cuentaPorCobrar->montoCuenta += $montoDetalle;
            $cuentaPorCobrar->save();
        } 

        // Responder con los datos de la venta y sus detalles
        return response()->json(['venta' => $venta, 'detalles' => $detallesData], 201);
    }

    public function anularVenta($idVenta)
    {
        // Buscar la venta y los detalles asociados
        $venta = Venta::find($idVenta);
        if (!$venta) {
            return response()->json(['error' => 'Venta no encontrada'], 404);
        }

        // Verificar si la venta tiene una cuenta por cobrar asociada
        $cuentaPorCobrar = CuentaPorCobrar::where('idCliente', $venta->idCliente)->first();
        if (!$cuentaPorCobrar) {
            return response()->json(['error' => 'Cuenta por cobrar no encontrada'], 404);
        }

        // Calcular el monto de la venta a revertir
        $montoAnulado = $venta->total - $venta->montoPagado; // La diferencia entre el total y el monto pagado

        // Registrar la compensación en el DetalleCC (detalle de la cuenta por cobrar)
        DetalleCC::create([
            'idCC' => $cuentaPorCobrar->idCC, // Asociar el detalle con la cuenta por cobrar
            'fecha' => now(),
            'motivo' => 'Anulación de Venta',
            'monto' => $montoAnulado, // El monto se coloca como negativo para revertir
            'saldo' => $cuentaPorCobrar->montoCuenta - $montoAnulado, // Nuevo saldo de la cuenta por cobrar
        ]);

        // Actualizar el saldo de la cuenta por cobrar
        $cuentaPorCobrar->montoCuenta -= $montoAnulado; // Reducir el monto de la cuenta por cobrar
        $cuentaPorCobrar->save();

        // Responder con éxito
        return response()->json(['message' => 'Venta anulada y saldo actualizado correctamente'], 200);
    }



    // Actualizar una venta
    public function update(Request $request, $id)
    {
        try {
            $venta = Venta::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'fecha' => 'required|date',
            'total' => 'numeric',
            'montoPagado' => 'nullable|numeric',
            'tipoVenta' => 'required|in:contado,credito',
            'metodoPago' => 'required|in:efectivo,tarjeta,yape,plin',
            'idTrabajador' => 'exists:trabajadores,idTrabajador',
            'idSede' => 'exists:sedes,idSede',
            'idCliente' => 'exists:clientes,idCliente',
            'estado' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Actualizar la venta
        $venta->update($request->all());
        return response()->json($venta);
    }

    // Eliminar una venta
    public function destroy($id)
    {
        try {
            $venta = Venta::findOrFail($id);
            $venta->delete();
            return response()->json(['message' => 'Venta eliminada con éxito']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }
    }
}
