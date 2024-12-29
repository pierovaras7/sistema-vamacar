<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\Trabajador;
use App\Models\Sede;
use App\Models\Cliente;
use App\Models\DetalleVenta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class VentaController extends Controller
{
    // Mostrar todos las ventas
    public function index()
    {
        $ventas = Venta::with(['trabajador', 'sede', 'cliente'])->get();
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
            'detalles' => 'required|array',
            'detalles.*.producto.idProducto' => 'required|exists:producto,idProducto', // Validación del producto
            'detalles.*.precio' => 'required|numeric|min:0',
            'detalles.*.cantidad' => 'required|numeric|min:1',
            'detalles.*.subtotal' => 'required|numeric|min:0', // Validación del subtotal
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Crear la venta
        $venta = Venta::create($request->only([
            'fecha', 'total', 'montoPagado', 'tipoVenta', 'metodoPago', 'estado'
        ]));

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
        }

        // Responder con los datos de la venta y sus detalles
        return response()->json(['venta' => $venta, 'detalles' => $detallesData], 201);
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
