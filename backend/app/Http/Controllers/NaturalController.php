<?php

namespace App\Http\Controllers;

use App\Models\Natural;
use Illuminate\Http\Request;

class NaturalController extends Controller
{
    public function index()
    {
        // Obtiene todos los registros de tipo Natural
        return response()->json(Natural::with('cliente')->get());
    }

    public function store(Request $request)
    {
        // Valida los datos
        $request->validate([
            'dni'=> 'required|string|size:8',
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'idCliente' => 'required|exists:cliente,idCliente',
            'estado' => 'required|boolean',
        ]);

        // Crea un nuevo registro de Natural
        $natural = Natural::create($request->all());

        return response()->json($natural, 201);
    }

    public function show($id)
    {
        // Obtiene un registro específico de tipo Natural
        $natural = Natural::with('cliente')->find($id);

        if (!$natural) {
            return response()->json(['message' => 'Natural no encontrado'], 404);
        }

        return response()->json($natural);
    }

    public function update(Request $request, $id)
    {
        // Valida los datos
        $request->validate([
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'idCliente' => 'required|exists:cliente,idCliente',
            'estado' => 'required|boolean',
        ]);

        $natural = Natural::find($id);

        if (!$natural) {
            return response()->json(['message' => 'Natural no encontrado'], 404);
        }

        // Actualiza el registro de Natural
        $natural->update($request->all());

        return response()->json($natural);
    }

    public function destroy($id)
    {
        // Elimina un registro de tipo Natural
        $natural = Natural::find($id);

        if (!$natural) {
            return response()->json(['message' => 'Natural no encontrado'], 404);
        }

        $natural->delete();

        return response()->json(['message' => 'Natural eliminado']);
    }

    public function getByCliente($idCliente)
{
    // Busca registros naturales asociados al cliente
    $naturales = Natural::with('cliente')
        ->where('idCliente', $idCliente)
        ->get();

    if ($naturales->isEmpty()) {
        return response()->json(['message' => 'No se encontraron registros naturales para este cliente'], 404);
    }

    return response()->json($naturales);
}

}
