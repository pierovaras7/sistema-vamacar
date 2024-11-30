<?php

namespace App\Http\Controllers;

use App\Models\Marca;
use Illuminate\Http\Request;

class MarcaController extends Controller
{

    public function index()
    {
        $marcas = Marca::all();
        return response()->json($marcas, 200);
    }


    public function store(Request $request)
    {
        $request->validate([
            'marca' => 'required|string|max:255',
            'estado' => 'required|boolean',
        ]);

        $marca = Marca::create($request->all());

        return response()->json([
            'message' => 'Marca creada exitosamente.',
            'marca' => $marca,
        ], 201);
    }


    public function show($id)
    {
        $marca = Marca::find($id);

        if (!$marca) {
            return response()->json(['message' => 'Marca no encontrada.'], 404);
        }

        return response()->json($marca, 200);
    }


    public function update(Request $request, $id)
    {
        $marca = Marca::find($id);

        if (!$marca) {
            return response()->json(['message' => 'Marca no encontrada.'], 404);
        }

        $request->validate([
            'marca' => 'sometimes|required|string|max:255',
            'estado' => 'sometimes|required|boolean',
        ]);

        $marca->update($request->all());

        return response()->json([
            'message' => 'Marca actualizada exitosamente.',
            'marca' => $marca,
        ], 200);
    }


    public function destroy($id)
    {
        $marca = Marca::find($id);

        if (!$marca) {
            return response()->json(['message' => 'Marca no encontrada.'], 404);
        }

        $marca->delete();

        return response()->json(['message' => 'Marca eliminada exitosamente.'], 200);
    }
}
