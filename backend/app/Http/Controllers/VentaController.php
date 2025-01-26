<?php

namespace App\Http\Controllers;

use App\Exports\VentasExport;
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
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class VentaController extends Controller
{
    // Mostrar todos las ventas, con opción de filtrar por rango de fechas
    public function index(Request $request)
    {
        $fechaInicio = $request->input('fechaInicio'); // Obtener el parámetro de fecha inicio
        $fechaFin = $request->input('fechaFin');       // Obtener el parámetro de fecha fin

        // Crear una consulta base con las relaciones necesarias
        $query = Venta::with([
            'trabajador', 
            'detalles.producto', 
            'sede', 
            'cliente' => function ($query) {
                $query->with(['natural', 'juridico']); // Cargar las relaciones 'natural' y 'juridico'
            }
        ]);

        if ($fechaInicio && $fechaFin) {
            // Si ambos parámetros están presentes, usar whereBetween
            $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
        } elseif ($fechaInicio) {
            // Si solo se proporciona fechaInicio, filtrar desde esa fecha
            $query->where('fecha', '>=', $fechaInicio);
        } elseif ($fechaFin) {
            // Si solo se proporciona fechaFin, filtrar hasta esa fecha
            $query->where('fecha', '<=', $fechaFin);
        } else {
            // Si no se proporcionan fechas, traer ventas del último mes
            $query->where('fecha', '>=', now()->subMonth());
        }        

        // Ordenar por fecha en orden descendente
        $ventas = $query->orderBy('fecha', 'desc')->get();

        return response()->json($ventas);
    }

    // Método para exportar las ventas a Excel
    public function exportVentas(Request $request)
    {
        $fechaInicio = $request->input('fechaInicio');
        $fechaFin = $request->input('fechaFin');

        return Excel::download(new VentasExport($fechaInicio, $fechaFin), 'ventas.xlsx');
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
        // Iniciar la transacción
        DB::beginTransaction();

        try {
            // Validar los datos de la venta y los detalles
            $validator = Validator::make($request->all(), [
                'fecha' => 'required|date_format:Y-m-d H:i:s', // Validar formato de fecha con hora
                'total' => 'numeric|required',
                'montoPagado' => 'nullable|numeric',
                'tipoVenta' => 'required|in:contado,credito',
                'metodoPago' => 'nullable|in:efectivo,tarjeta,yape,plin',
                'estado' => 'boolean',
                'cliente' => 'required',
                'detalles' => 'required|array',
                'detalles.*.producto.idProducto' => 'required|exists:producto,idProducto', // Validación del producto
                'detalles.*.precio' => 'required|numeric|min:0',
                'detalles.*.cantidad' => 'required|numeric|min:1',
                'detalles.*.subtotal' => 'required|numeric|min:0', // Validación del subtotal
            ]);

            if ($validator->fails()) {
                // Si la validación falla, lanzar excepción para hacer rollback
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

                if ($invProd) {
                    MovInventario::create([
                        'tipo' => 'Salida',
                        'descripcion' => 'Venta Realizada',
                        'fecha' => $venta->fecha,
                        'cantidad' => $detalle['cantidad'],
                        'stockRestante' => $invProd->stockActual - $detalle['cantidad'],
                        'idInventario' => $invProd->idInventario
                    ]);
                };

                $invProd->stockActual -= $detalle['cantidad'];
                $invProd->save();
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

            // Si todo es correcto, hacer commit de la transacción
            DB::commit();

            $venta->load([
                'detalles.producto',
                'cliente.natural', 
                'cliente.juridico',
                'sede'
            ]);            
            // Responder con los datos de la venta y sus detalles
            return response()->json(['venta' => $venta], 201);
        } catch (\Exception $e) {
            // Si algo falla, hacer rollback de la transacción
            DB::rollBack();

            // Capturar el error y devolver un mensaje de error
            return response()->json(['error' => 'Hubo un error procesando la venta', 'details' => $e->getMessage()], 500);
        }
    }


    public function anularVenta($idVenta)
    {
        DB::beginTransaction();

        try {
            // Buscar la venta
            $venta = Venta::with('detalles')->find($idVenta);
            if (!$venta) {
                return response()->json(['error' => 'Venta no encontrada'], 404);
            }


            // Actualizar cuenta por cobrar si existe
            $cuentaPorCobrar = CuentaPorCobrar::where('idCliente', $venta->idCliente)->first();
            if ($cuentaPorCobrar && ($venta->tipoVenta == 'credito')) {

                $montoDeuda = $venta->total - $venta->montoPagado;

                // Registrar un nuevo detalle para la anulación
                DetalleCC::create([
                    'idCC' => $cuentaPorCobrar->idCC,
                    'fecha' => now()->format('Y-m-d H:i:s'),
                    'motivo' => 'Anulación de Venta',
                    'monto' => $montoDeuda, // Monto negativo para revertir
                    'saldo' => max($cuentaPorCobrar->montoCuenta - $montoDeuda, 0), // Nuevo saldo, asegurando que no sea menor a 0
                ]);

                // Actualizar el saldo de la cuenta por cobrar
                $cuentaPorCobrar->montoCuenta -= $montoDeuda;

                // Asegurar que el saldo no sea menor que 0
                if ($cuentaPorCobrar->montoCuenta < 0) {
                    $cuentaPorCobrar->montoCuenta = 0;
                }

                $cuentaPorCobrar->save();
            }


            // Revertir los detalles de la venta en el inventario
            foreach ($venta->detalles as $detalle) {
                $invProd = Inventario::where('idProducto', $detalle->idProducto)->first();

                if ($invProd) {
                    // Registrar movimiento de inventario de entrada
                    MovInventario::create([
                        'tipo' => 'Entrada',
                        'descripcion' => 'Anulación de Venta',
                        'fecha' => now()->format('Y-m-d H:i:s'),
                        'cantidad' => $detalle->cantidad,
                        'stockRestante' => $invProd->stockActual + $detalle->cantidad,
                        'idInventario' => $invProd->idInventario
                    ]);

                    // Actualizar el stock sumando la cantidad de la venta anulada
                    $invProd->stockActual += $detalle->cantidad;
                    $invProd->save();
                }
            }

            // Cambiar el estado de la venta a anulada
            $venta->estado = 0; // Suponiendo que "0" representa un estado anulado
            $venta->save();

            DB::commit();

            return response()->json(['message' => 'Venta anulada correctamente, cuenta e inventario actualizados'], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Error al anular la venta', 'details' => $e->getMessage()], 500);
        }
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
