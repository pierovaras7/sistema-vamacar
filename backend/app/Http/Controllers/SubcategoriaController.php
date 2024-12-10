<?php

namespace App\Http\Controllers;

use App\Models\Subcategoria;
use Illuminate\Http\Request;

class SubcategoriaController extends Controller
{
    public function index()
    {
        try {
            $subcategorias = Subcategoria::with('categoria')->get();
            return response()->json($subcategorias, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al listar las subcategorías.', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'subcategoria' => 'required|string|max:255',
                'idCategoria' => 'required|exists:categoria,idCategoria',
            ]);

            $subcategoriaExistente = Subcategoria::where('subcategoria', $request->input('subcategoria'))
                                                ->where('idCategoria', $request->input('idCategoria'))
                                                ->first();

            if ($subcategoriaExistente) {
                if ($subcategoriaExistente->estado == false) {
                    $subcategoriaExistente->estado = true; 
                    $subcategoriaExistente->save();

                    return response()->json([
                        'message' => 'Subcategoría activada exitosamente.',
                        'subcategoria' => $subcategoriaExistente,
                    ], 200);
                }

                return response()->json(['message' => 'La subcategoría ya está activa y no puede ser duplicada.'], 400);
            }

            $subcategoria = Subcategoria::create([
                'subcategoria' => $request->input('subcategoria'),
                'idCategoria' => $request->input('idCategoria'),
                'estado' => true, 
            ]);

            return response()->json([
                'message' => 'Subcategoría creada exitosamente.',
                'subcategoria' => $subcategoria,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear o actualizar la subcategoría.', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $subcategoria = Subcategoria::with('categoria')->find($id);

            if (!$subcategoria) {
                return response()->json(['message' => 'Subcategoría no encontrada.'], 404);
            }

            return response()->json($subcategoria, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al buscar la subcategoría.', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $subcategoria = Subcategoria::find($id);

            if (!$subcategoria) {
                return response()->json(['message' => 'Subcategoría no encontrada.'], 404);
            }

            $request->validate([
                'subcategoria' => 'sometimes|required|string|max:255',
                'idCategoria' => 'sometimes|required|exists:categoria,idCategoria',
                'estado' => 'sometimes|required|boolean',
            ]);

            $subcategoria->update($request->all());

            return response()->json([
                'message' => 'Subcategoría actualizada exitosamente.',
                'subcategoria' => $subcategoria,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar la subcategoría.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $subcategoria = Subcategoria::find($id);

            if (!$subcategoria) {
                return response()->json(['message' => 'Subcategoría no encontrada.'], 404);
            }

            $subcategoria->estado = false;
            $subcategoria->save();

            return response()->json(['message' => 'Subcategoría eliminada exitosamente.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al desactivar la subcategoría.', 'error' => $e->getMessage()], 500);
        }
    }

    public function getSubcategoriasByCategoria($idCategoria)
{
    try {
        $subcategorias = Subcategoria::where('idCategoria', $idCategoria)
            ->where('estado', true) // Filtra solo las subcategorías activas
            ->get();

        if ($subcategorias->isEmpty()) {
            return response()->json(['message' => 'No se encontraron subcategorías para esta categoría.'], 404);
        }

        return response()->json($subcategorias, 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Error al obtener las subcategorías.', 'error' => $e->getMessage()], 500);
    }
}

}
