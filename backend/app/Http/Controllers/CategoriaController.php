<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{

    public function index()
    {
        $categorias = Categoria::all();
        return response()->json($categorias, 200);
    }


    public function store(Request $request)
    {
        $request->validate([
            'categoria' => 'required|string|max:255',
        ]);

        $existingCategoria = Categoria::where('categoria', $request->input('categoria'))->first();

        if ($existingCategoria) {
            if ($existingCategoria->estado == false) {
                $existingCategoria->estado = true;
                $existingCategoria->save();

                return response()->json([
                    'message' => 'Categoría reactivada exitosamente.',
                    'categoria' => $existingCategoria,
                ], 200);
            } else {
                return response()->json(['message' => 'La categoría ya está creada y activa.'], 400);
            }
        }

        $categoria = Categoria::create([
            'categoria' => $request->input('categoria'),
            'estado' => true, 
        ]);

        return response()->json([
            'message' => 'Categoría creada exitosamente.',
            'categoria' => $categoria,
        ], 201);
    }
    public function show($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json(['message' => 'Categoría no encontrada.'], 404);
        }

        return response()->json($categoria, 200);
    }


    public function update(Request $request, $id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json(['message' => 'Categoría no encontrada.'], 404);
        }

        $request->validate([
            'categoria' => 'sometimes|required|string|max:255',
            'estado' => 'sometimes|required|boolean',
        ]);

        $categoria->update($request->all());

        return response()->json([
            'message' => 'Categoría actualizada exitosamente.',
            'categoria' => $categoria,
        ], 200);
    }


    public function destroy($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json(['message' => 'Categoría no encontrada.'], 404);
        }

        $categoria->estado = false;
        $categoria->save();

        return response()->json(['message' => 'Categoría eliminada exitosamente.'], 200);
    }
}
