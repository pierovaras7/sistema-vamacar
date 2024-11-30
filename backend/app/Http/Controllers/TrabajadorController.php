<?php

namespace App\Http\Controllers;

use App\Models\Trabajador;
use Illuminate\Http\Request;

class TrabajadorController extends Controller
{
    /**
     * Muestra una lista de trabajadores.
     */
    public function index()
    {
        $trabajadores = Trabajador::all();
        return response()->json($trabajadores);
    }

    /**
     * Almacena un nuevo trabajador.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'telefono' => 'required|string|max:15',
            'sexo' => 'required|string|max:10',
            'direccion' => 'nullable|string|max:255',
            'dni' => 'required|string|max:20|unique:trabajador,dni',
            'area' => 'nullable|string|max:100',
            'fechaNacimiento' => 'required|date',
            'turno' => 'nullable|string|max:50',
            'salario' => 'required|numeric|min:0',
            'estado' => 'required|boolean',
        ]);

        $trabajador = Trabajador::create($validatedData);
        return response()->json($trabajador, 201);
    }

    /**
     * Muestra los detalles de un trabajador específico.
     */
    public function show($id)
    {
        $trabajador = Trabajador::findOrFail($id);
        return response()->json($trabajador);
    }

    /**
     * Actualiza un trabajador existente.
     */
    public function update(Request $request, $id)
    {
        $trabajador = Trabajador::findOrFail($id);

        $validatedData = $request->validate([
            'nombres' => 'sometimes|string|max:255',
            'apellidos' => 'sometimes|string|max:255',
            'telefono' => 'sometimes|string|max:15',
            'sexo' => 'sometimes|string|max:10',
            'direccion' => 'nullable|string|max:255',
            'dni' => 'sometimes|string|max:20|unique:trabajador,dni,' . $trabajador->idTrabajador . ',idTrabajador',
            'area' => 'nullable|string|max:100',
            'fechaNacimiento' => 'sometimes|date',
            'turno' => 'nullable|string|max:50',
            'salario' => 'sometimes|numeric|min:0',
            'estado' => 'sometimes|boolean',
        ]);

        $trabajador->update($validatedData);
        return response()->json($trabajador);
    }

    /**
     * Elimina un trabajador.
     */
    public function destroy($id)
    {
        $trabajador = Trabajador::findOrFail($id);
        $trabajador->delete();
        return response()->json(['message' => 'Trabajador eliminado correctamente.']);
    }
}
