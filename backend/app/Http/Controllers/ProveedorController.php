<?php

namespace App\Http\Controllers;

use App\Models\Proveedor;
use Illuminate\Http\Request;

class ProveedorController extends Controller
{
    // Obtener todos los proveedores activos
    public function index()
    {
        try {
            $proveedores = Proveedor::all();
            return response()->json($proveedores, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al listar los proveedores.', 'error' => $e->getMessage()], 500);
        }
    }

    // Obtener un proveedor por RUC (solo activos)
    public function getByRuc($ruc)
    {
        $proveedor = Proveedor::where('ruc', $ruc)->where('estado', true)->first();

        if (!$proveedor) {
            return response()->json(['message' => 'Proveedor no encontrado.'], 404);
        }

        return response()->json($proveedor, 200);
    }

    // Crear un nuevo proveedor
    public function store(Request $request)
    {
        $request->validate([
            'ruc' => 'required|string|max:11',
            'razonSocial' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'correo' => 'nullable|email|max:255',
            'direccion' => 'nullable|string|max:255',
            'nombreRepresentante'  => 'nullable|string|max:255',
        ]);

        $existingProveedor = Proveedor::where('ruc', $request->input('ruc'))->first();

        if ($existingProveedor) {
            if ($existingProveedor->estado == true) {
                return response()->json(['message' => 'El proveedor ya existe.'], 400);
            }

            // Reactivar proveedor si está inactivo
            $existingProveedor->estado = true;
            $existingProveedor->save();

            return response()->json([
                'message' => 'Proveedor reactivado exitosamente.',
                'proveedor' => $existingProveedor,
            ], 200);
        }

        // Crear un nuevo proveedor
        $proveedor = Proveedor::create(array_merge(
            $request->all(),
            ['estado' => true]
        ));

        return response()->json([
            'message' => 'Proveedor creado exitosamente.',
            'proveedor' => $proveedor,
        ], 201);
    }

    // Actualizar un proveedor existente
    public function update(Request $request, $id)
    {
        $proveedor = Proveedor::find($id);
    
        if (!$proveedor || !$proveedor->estado) {
            return response()->json(['message' => 'Proveedor no encontrado.'], 404);
        }
    
        $request->validate([
            'ruc' => 'sometimes|required|string|max:11',
            'razonSocial' => 'sometimes|required|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'correo' => 'nullable|email|max:255',
            'direccion' => 'nullable|string|max:255',
            'nombreRepresentante'  => 'nullable|string|max:255',
        ]);
    
        // Verificar si el RUC está siendo cambiado
        if ($request->has('ruc') && $request->input('ruc') !== $proveedor->ruc) {
            $existingProveedor = Proveedor::where('ruc', $request->input('ruc'))->first();
    
            if ($existingProveedor) {
                if ($existingProveedor->estado) {
                    return response()->json(['message' => 'El RUC ya existe y está activo.'], 400);
                }
    
                // Reactivar el proveedor existente e inactivo
                $existingProveedor->update(array_merge(
                    $request->all(),
                    ['estado' => true]
                ));
    
                return response()->json([
                    'message' => 'Proveedor reactivado y actualizado exitosamente.',
                    'proveedor' => $existingProveedor,
                ], 200);
            }
        }
    
        // Actualizar el proveedor actual
        $proveedor->update($request->all());
    
        return response()->json([
            'message' => 'Proveedor actualizado exitosamente.',
            'proveedor' => $proveedor,
        ], 200);
    }
    
    // Eliminación lógica de un proveedor
    public function destroy($id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor || !$proveedor->estado) {
            return response()->json(['message' => 'Proveedor no encontrado.'], 404);
        }

        $proveedor->estado = false;
        $proveedor->save();

        return response()->json(['message' => 'Proveedor eliminado exitosamente.'], 200);
    }
}
