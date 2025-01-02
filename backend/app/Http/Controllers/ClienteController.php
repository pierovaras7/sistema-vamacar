<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index()
{
    $clientes = Cliente::where("estado","=",1)->with(['juridico', 'natural'])->get();
    
    // Retorna la respuesta JSON con los clientes
    return response()->json($clientes);
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

        // Cargar relación condicionalmente
        if ($cliente->tipoCliente === 'natural') {
            $cliente->load('natural');
        } elseif ($cliente->tipoCliente === 'juridico') {
            $cliente->load('juridico');
        }

        return response()->json($cliente);
    }

    public function findCliente($valor)
    {
        if (!$valor) {
            return response()->json(['message' => 'Debe proporcionar un valor para buscar.'], 400);
        }

        // Buscar en la relación Natural por dni
        $clienteNatural = Cliente::whereHas('natural', function ($query) use ($valor) {
            $query->where('dni', $valor);
        })->with('natural')->first();

        if ($clienteNatural) {
            return response()->json($clienteNatural);
        }

        // Buscar en la relación Juridico por ruc
        $clienteJuridico = Cliente::whereHas('juridico', function ($query) use ($valor) {
            $query->where('ruc', $valor);
        })->with('juridico')->first();

        if ($clienteJuridico) {
            return response()->json($clienteJuridico);
        }

        return response()->json(['message' => 'Cliente no encontrado.'], 404);
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
        $cliente = Cliente::find($id);
    
        if (!$cliente) {
            return response()->json([
                'message' => 'Cliente no encontrado.'
            ], 404);  // Código 404: No encontrado
        }
    
        try {
            // Eliminar el cliente
            $cliente->estado = 0;  // Suponiendo que "estado" representa la eliminación lógica
            $cliente->save();
    
            return response()->json([
                'message' => 'Cliente eliminado correctamente.'
            ], 200);  // Código 200: OK
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el cliente.',
                'error' => $e->getMessage()
            ], 500);  // Código 500: Error interno del servidor
        }
    }
    
}
