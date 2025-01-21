<?php

namespace App\Http\Controllers;

use App\Models\Compra;
use App\Models\DetalleCompra;
use App\Models\CuentasPorPagar;
use App\Models\Inventario;
use App\Models\MovInventario;
use App\Models\Proveedor;
use Illuminate\Http\Request;

class CompraController extends Controller
{

    public function index()
    {
        try {
            // Obtener solo las compras con estado "true"
            $compras = Compra::with([
                'proveedor',
                'detalleCompra.producto'
            ])
            ->where('estado', true) // Filtrar por estado true
            ->get();
    
            return response()->json($compras, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al listar las compras.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    public function getCuentasPorPagar()
{
    try {
        // Obtener las cuentas por pagar con las relaciones necesarias
        $cuentasPorPagar = CuentasPorPagar::with([
            'compra.proveedor' // Relación para obtener el proveedor desde la compra
        ])
        ->get()
        ->map(function ($cuenta) {
            return [
                'idCP' => $cuenta->idCP,
                'idCompra' => $cuenta->idCompra,
                'montoPago' => $cuenta->montoPago,
                'estado' => $cuenta->estado,
                'fechaPedido' => $cuenta->compra->fechaPedido ?? null,
                'fechaPago' => $cuenta->compra->fechaPago ?? null,
                'proveedor' => $cuenta->compra->proveedor->razonSocial ?? 'Proveedor no encontrado',
            ];
        });

        return response()->json($cuentasPorPagar, 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error al obtener las cuentas por pagar.',
            'error' => $e->getMessage()
        ], 500);
    }
}
    


    public function getEstado()
    {
        try {
            $estados = CuentasPorPagar::select('idCP','idCompra','estado')->get();
            return response()->json($estados, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener los estados.', 'error' => $e->getMessage()], 500);
        }
    }


    public function updateEstado(Request $request, $idCompra)
    {
        try {
            $request->validate([
                'estado' => 'required|boolean', // Validación para asegurar que sea booleano
            ]);
    
            // Encontrar la cuenta por pagar
            $cuenta = CuentasPorPagar::where('idCompra', $idCompra)->first();
    
            if (!$cuenta) {
                return response()->json(['message' => 'Cuenta por pagar no encontrada.'], 404);
            }
    
            // Actualizar el estado en cuentas_por_pagar
            $cuenta->update(['estado' => $request->estado]);
    
    
            return response()->json(['message' => 'Estado actualizado exitosamente.', 'cuenta' => $cuenta], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar el estado.', 'error' => $e->getMessage()], 500);
        }
    }
    

    public function store(Request $request)
    {
        try {
            $request->validate([
                'fechaPedido' => 'required|date',
                'fechaPago' => 'nullable|date',
                'proveedor' => 'required',
                'detalle' => 'required|array',
                'detalle.*.idProducto' => 'required|exists:producto,idProducto',
                'detalle.*.cantidad' => 'required|numeric|min:1',
                'detalle.*.precioCosto' => 'required|numeric|min:0',
            ]);
    
            $total = 0;
            $productosValidos = [];
    
            // Validar y actualizar inventario para cada producto
            foreach ($request->detalle as $detalle) {
                $inventario = Inventario::where('idProducto', $detalle['idProducto'])->first();
    
                if (!$inventario) {
                    return response()->json([
                        'message' => "El producto con ID {$detalle['idProducto']} no tiene un registro en el inventario."
                    ], 404);
                }
    
                // Agregar el producto como válido
                $productosValidos[] = [
                    'idProducto' => $detalle['idProducto'],
                    'cantidad' => $detalle['cantidad'],
                    'subtotal' => $detalle['cantidad'] * $detalle['precioCosto'],
                    'idInventario' => $inventario->idInventario,
                ];
    
                // Calcular el subtotal del detalle
                $total += $detalle['cantidad'] * $detalle['precioCosto'];
            }

            $idProveedor = $request->proveedor['idProveedor'];

            $prov = Proveedor::find($idProveedor);
            
            if (!$prov) {
                // Aquí puedes definir los datos que deseas usar para crear el nuevo proveedor
                $prov = Proveedor::create([
                    'ruc' => $request->proveedor['ruc'],
                    'razonSocial' => $request->proveedor['razonSocial'],
                    'telefono' => $request->proveedor['telefono'],
                    'correo' => $request->proveedor['correo'],
                    'direccion' => $request->proveedor['direccion'],
                ]);
            }
            
            // Crear la compra
            $compra = Compra::create([
                'fechaPedido' => $request->fechaPedido,
                'fechaPago' => $request->fechaPago,
                'idProveedor' => $prov->idProveedor,
                'total' => $total,
            ]);
    
            // Crear los detalles de la compra, actualizar inventario y registrar movimiento
            foreach ($productosValidos as $producto) {
                DetalleCompra::create([
                    'idCompra' => $compra->idCompra,
                    'idProducto' => $producto['idProducto'],
                    'cantidad' => $producto['cantidad'],
                    'precioCosto' => $producto['subtotal'] / $producto['cantidad'],
                    'subtotal' => $producto['subtotal'],
                ]);
    
                // Actualizar el inventario
                $inventario = Inventario::find($producto['idInventario']);
    
                // Registrar movimiento de inventario
                MovInventario::create([
                    'tipo' => 'Entrada',
                    'descripcion' => 'Compra Realizada',
                    'fecha' => now()->format('Y-m-d H:i:s'),
                    'cantidad' => $producto['cantidad'],
                    'stockRestante' => $inventario->stockActual + $producto['cantidad'],
                    'idInventario' => $producto['idInventario'],
                    'estado' => 1, // Estado activo
                ]);

                $inventario->stockActual += $detalle['cantidad'];
                $inventario->save();
            }
    
            // Registrar la cuenta por pagar
            CuentasPorPagar::create([
                'montoPago' => $total,
                'idCompra' => $compra->idCompra,
                'estado' => 0,
            ]);
    
            return response()->json([
                'message' => 'Compra creada exitosamente.',
                'compra' => $compra,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear la compra.', 'error' => $e->getMessage()], 500);
        }
    }
    
    
    public function show($id)
    {
        try {
            $compra = Compra::with(['proveedor', 'detalleCompra'])->find($id);

            if (!$compra) {
                return response()->json(['message' => 'Compra no encontrada.'], 404);
            }

            return response()->json($compra, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al buscar la compra.', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $compra = Compra::find($id);
    
            if (!$compra) {
                return response()->json(['message' => 'Compra no encontrada.'], 404);
            }
    
            $request->validate([
                'fechaPedido' => 'sometimes|date',
                'fechaRecibido' => 'sometimes|nullable|date',
                'fechaPago' => 'sometimes|nullable|date',
                'idProveedor' => 'sometimes|exists:proveedor,idProveedor',
                'detalle' => 'sometimes|array',
                'detalle.*.idProducto' => 'required|exists:producto,idProducto',
                'detalle.*.cantidad' => 'required|numeric|min:1',
                'detalle.*.precioCosto' => 'required|numeric|min:0',
            ]);
    
            // Actualizar los campos principales de la compra
            $compra->update($request->only(['fechaPedido', 'fechaRecibido', 'fechaPago', 'idProveedor']));
    
            $total = 0;
    
            if ($request->has('detalle')) {
                $detallesExistentes = DetalleCompra::where('idCompra', $id)->get();
    
                foreach ($detallesExistentes as $detalleExistente) {
                    $inventario = Inventario::where('idProducto', $detalleExistente->idProducto)->first();
    
                    if ($inventario) {
                        // Revertir el stock actual en inventario
                        $inventario->update([
                            'stockActual' => $inventario->stockActual - $detalleExistente->cantidad
                        ]);
    
                        // Registrar un nuevo movimiento de tipo "entrada" con descripción "compra editada"
                        MovInventario::create([
                            'tipo' => 'entrada',
                            'descripcion' => 'compra editada',
                            'fecha' => now()->format('Y-m-d H:i:s'),
                            'cantidad' => -$detalleExistente->cantidad,
                            'idInventario' => $inventario->idInventario,
                            'estado' => 1,
                        ]);
                    }
                }
    
                // Eliminar los detalles existentes
                DetalleCompra::where('idCompra', $id)->delete();
    
                // Crear los nuevos detalles y calcular el nuevo total
                foreach ($request->detalle as $detalle) {
                    $inventario = Inventario::where('idProducto', $detalle['idProducto'])->first();
    
                    if (!$inventario) {
                        return response()->json([
                            'message' => "El producto con ID {$detalle['idProducto']} no tiene un registro en el inventario."
                        ], 404);
                    }
    
                    // Calcular el nuevo stock
                    $nuevoStock = $inventario->stockActual + $detalle['cantidad'];
    
                    // Validar si el nuevo stock excede el stock mínimo
                    if ($nuevoStock > $inventario->stockMinimo) {
                        return response()->json([
                            'message' => "La compra excede el stock mínimo permitido para el producto con ID {$detalle['idProducto']}.",
                            'idProducto' => $detalle['idProducto']
                        ], 400);
                    }
    
                    // Registrar el nuevo detalle
                    $subtotal = $detalle['cantidad'] * $detalle['precioCosto'];
                    DetalleCompra::create([
                        'idCompra' => $compra->idCompra,
                        'idProducto' => $detalle['idProducto'],
                        'cantidad' => $detalle['cantidad'],
                        'precioCosto' => $detalle['precioCosto'],
                        'subtotal' => $subtotal,
                    ]);
    
                    // Actualizar el inventario
                    $inventario->update([
                        'stockActual' => $nuevoStock
                    ]);
    
                    // Registrar un nuevo movimiento de tipo "entrada" con descripción "compra editada"
                    MovInventario::create([
                        'tipo' => 'entrada',
                        'descripcion' => 'compra editada',
                        'fecha' => now()->format('Y-m-d H:i:s'),
                        'cantidad' => $detalle['cantidad'],
                        'idInventario' => $inventario->idInventario,
                        'estado' => 1,
                    ]);
    
                    // Actualizar el total
                    $total += $subtotal;
                }
    
                // Actualizar el total de la compra
                $compra->update(['total' => $total]);
            }
    
            return response()->json(['message' => 'Compra actualizada exitosamente.', 'compra' => $compra], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar la compra.', 'error' => $e->getMessage()], 500);
        }
    }
    
    


    
    public function anularCompra($id)
    {
        try {
            // Buscar la compra
            $compra = Compra::with('detalleCompra.producto')->find($id);
    
            if (!$compra) {
                return response()->json(['message' => 'Compra no encontrada.'], 404);
            }
    
            // Cambiar el estado de la compra a "false"
            $compra->estado = false;
            $compra->save();

            $cuentaPorPagar = CuentasPorPagar::where('idCompra', $id)->first();

            // Verificar si existe la cuenta por pagar
            if ($cuentaPorPagar) {
                // Eliminar la cuenta por pagar
                $cuentaPorPagar->delete();
            }
    
    
            // Iterar sobre los detalles de la compra para actualizar el inventario y registrar movimientos
            foreach ($compra->detalleCompra as $detalle) {
                $inventario = Inventario::where('idProducto', $detalle->idProducto)->first();
    
                if ($inventario) {
                    // Restar la cantidad del inventario
                    $inventario->stockActual -= $detalle->cantidad;
                    $inventario->save();
    
                    // Registrar el movimiento de inventario
                    MovInventario::create([
                        'tipo' => 'Salida', // Movimiento de salida
                        'descripcion' => 'Compra Anulada',
                        'fecha' => now()->format('Y-m-d H:i:s'),
                        'cantidad' => $detalle->cantidad,
                        'stockRestante' => $inventario->stockActual - $detalle->cantidad,
                        'idInventario' => $inventario->idInventario          
                    ]);
                }
            }
    
            return response()->json(['message' => 'Compra eliminada exitosamente.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar la compra.', 'error' => $e->getMessage()], 500);
        }
    }
    
}

