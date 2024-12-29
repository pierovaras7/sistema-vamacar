<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index()
    {
        // Obtiene todos los clientes
        return response()->json(Cliente::all());
    }

    public function store(Request $request)
    {
        // Valida los datos antes de guardarlos
        $request->validate([
            'tipoCliente' => 'required|string|max:255',
            'telefono' => 'required|string|max:15',
            'correo' => 'required|email',
            'direccion' => 'required|string|max:255',
            'estado' => 'required|boolean',
        ]);

        // Crea un nuevo cliente
        $cliente = Cliente::create($request->all());

        return response()->json($cliente, 201);
    }

    public function show($id)
    {
        // Obtiene un cliente específico por su ID
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        return response()->json($cliente);
    }

    public function update(Request $request, $id)
    {
        // Valida los datos
        $request->validate([
            'tipoCliente' => 'required|string|max:255',
            'telefono' => 'required|string|max:15',
            'correo' => 'required|email',
            'direccion' => 'required|string|max:255',
            'estado' => 'required|boolean',
        ]);

        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        // Actualiza los datos del cliente
        $cliente->update($request->all());

        return response()->json($cliente);
    }

    public function destroy($id)
    {
        // Elimina un cliente
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        $cliente->delete();

        return response()->json(['message' => 'Cliente eliminado']);
    }
}
