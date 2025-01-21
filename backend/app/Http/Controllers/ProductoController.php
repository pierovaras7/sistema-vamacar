<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{

    public function index(Request $request)
    {
        try {
            // Usamos eager loading para obtener los productos junto con su inventario
            $productos = Producto::with(['subcategoria', 'marca', 'inventario'])->get();

            // Agregamos el stock al resultado
            $productosConStock = $productos->map(function ($producto) {
                // Si el producto tiene inventario, agregamos el stock
                $producto->stockActual = $producto->inventario ? $producto->inventario->stockActual : 0; // Si no tiene inventario, asignamos 0
                return $producto;
            });

            return response()->json($productosConStock, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al listar los productos.', 'error' => $e->getMessage()], 500);
        }
    }



    public function store(Request $request)
    {
        try {
            $request->validate([
                'descripcion' => 'required|string|max:255',
                'codigo' => 'required|string|max:50',
                'uni_medida' => 'required|string|max:10',
                'precioCosto' => 'required|numeric|min:0',
                'precioMinVenta' => 'required|numeric|min:0',
                'precioMaxVenta' => 'required|numeric|min:0',
                'precioXMayor' => 'required|numeric|min:0',
                'idSubcategoria' => 'required|exists:subcategoria,idSubcategoria',
                'idMarca' => 'required|exists:marca,idMarca',
            ]);
    
            $productoExistente = Producto::where('codigo', $request->input('codigo'))->first();
    
            if ($productoExistente) {
                if ($productoExistente->estado == true) {
                    return response()->json(['message' => 'Ya existe un producto con este código y está activo.'], 400);
                }
    
                $productoExistente->descripcion = $request->input('descripcion');
                $productoExistente->uni_medida = $request->input('uni_medida');
                $productoExistente->precioCosto = $request->input('precioCosto');
                $productoExistente->precioMinVenta = $request->input('precioMinVenta');
                $productoExistente->precioMaxVenta = $request->input('precioMaxVenta');
                $productoExistente->precioXMayor = $request->input('precioXMayor');
                $productoExistente->ubicacion = $request->input('ubicacion');
                $productoExistente->idSubcategoria = $request->input('idSubcategoria');
                $productoExistente->idMarca = $request->input('idMarca');
                $productoExistente->estado = true; // Cambiar el estado a true para activarlo
                $productoExistente->save();
    
                return response()->json([
                    'message' => 'Producto actualizado y activado exitosamente.',
                    'producto' => $productoExistente,
                ], 200);
            }
    
            $producto = Producto::create([
                'descripcion' => $request->input('descripcion'),
                'codigo' => $request->input('codigo'),
                'uni_medida' => $request->input('uni_medida'),
                'precioCosto' => $request->input('precioCosto'),
                'precioMinVenta' => $request->input('precioMinVenta'),
                'precioMaxVenta' => $request->input('precioMaxVenta'),
                'precioXMayor' => $request->input('precioXMayor'),
                'ubicacion' => $request->input('ubicacion'),
                'idSubcategoria' => $request->input('idSubcategoria'),
                'idMarca' => $request->input('idMarca'),
                'estado' => true, // Estado por defecto
            ]);
    
            // Crear inventario asociado
            Inventario::create([
                'idProducto' => $producto->idProducto,
                'stockMinimo'  => $request->input('stockMinimo'), 
                'stockActual' => $request->input('stockInicial'),
            ]);

            return response()->json([
                'message' => 'Producto creado exitosamente.',
                'producto' => $producto,
            ], 201);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear o actualizar el producto.', 'error' => $e->getMessage()], 500);
        }
    }
    
    public function show($id)
    {
        try {
            $producto = Producto::with(['subcategoria', 'marca'])->find($id);

            if (!$producto) {
                return response()->json(['message' => 'Producto no encontrado.'], 404);
            }

            return response()->json($producto, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al buscar el producto.', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $producto = Producto::find($id);

            if (!$producto) {
                return response()->json(['message' => 'Producto no encontrado.'], 404);
            }

            $request->validate([
                'descripcion' => 'sometimes|required|string|max:255',
                'codigo' => 'sometimes|required|string|max:50|unique:producto,codigo,' . $id . ',idProducto',
                'uni_medida' => 'sometimes|required|string|max:10',
                'precioCosto' => 'sometimes|required|numeric|min:0',
                'precioMinVenta' => 'sometimes|required|numeric|min:0',
                'precioMaxVenta' => 'sometimes|required|numeric|min:0',
                'precioXMayor' => 'sometimes|required|numeric|min:0',
                'idSubcategoria' => 'sometimes|required|exists:subcategoria,idSubcategoria',
                'idMarca' => 'sometimes|required|exists:marca,idMarca',
                'estado' => 'sometimes|required|boolean',
            ]);

            $producto->update($request->all());

            // Crear inventario asociado
            $inventario = Inventario::where("idProducto", "=", $id)->first();
            $inventario->stockMinimo = $request->input('stockMinimo');
            $inventario->save();

            return response()->json([
                'message' => 'Producto actualizado exitosamente.',
                'producto' => $producto,
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar el producto.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $producto = Producto::find($id);
    
            if (!$producto) {
                return response()->json(['message' => 'Producto no encontrado.'], 404);
            }
    
            $producto->estado = false;
            $producto->save();
    
            return response()->json(['message' => 'Producto eliminado  exitosamente.'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el producto.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
}
