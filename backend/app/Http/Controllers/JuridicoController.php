<?php

namespace App\Http\Controllers;

use App\Models\Juridico;
use Illuminate\Http\Request;

class JuridicoController extends Controller
{
    public function index()
    {
        // Obtiene todos los registros de tipo Juridico
        return response()->json(Juridico::with('cliente')->get());
    }

    public function store(Request $request)
    {
        // Valida los datos
        $request->validate([
            'razonSocial' => 'required|string|max:255',
            'ruc' => 'required|string|max:15',
            'idCliente' => 'required|exists:cliente,idCliente',
            'representante' => 'required|string|max:255',
            'estado' => 'required|boolean',
        ]);

        // Crea un nuevo registro de Juridico
        $juridico = Juridico::create($request->all());

        return response()->json($juridico, 201);
    }

    public function show($id)
    {
        // Obtiene un registro específico de tipo Juridico
        $juridico = Juridico::with('cliente')->find($id);

        if (!$juridico) {
            return response()->json(['message' => 'Juridico no encontrado'], 404);
        }

        return response()->json($juridico);
    }

    public function update(Request $request, $id)
    {
        // Valida los datos
        $request->validate([
            'razonSocial' => 'required|string|max:255',
            'ruc' => 'required|string|max:15',
            'idCliente' => 'required|exists:cliente,idCliente',
            'representante' => 'required|string|max:255',
            'estado' => 'required|boolean',
        ]);

        $juridico = Juridico::find($id);

        if (!$juridico) {
            return response()->json(['message' => 'Juridico no encontrado'], 404);
        }

        // Actualiza el registro de Juridico
        $juridico->update($request->all());

        return response()->json($juridico);
    }

    public function destroy($id)
    {
        // Elimina un registro de tipo Juridico
        $juridico = Juridico::find($id);

        if (!$juridico) {
            return response()->json(['message' => 'Juridico no encontrado'], 404);
        }

        $juridico->delete();

        return response()->json(['message' => 'Juridico eliminado']);
    }


    public function getByCliente($idCliente)
    {
        // Busca registros jurídicos asociados al cliente
        $juridicos = Juridico::with('cliente')
            ->where('idCliente', $idCliente)
            ->get();

        if ($juridicos->isEmpty()) {
            return response()->json(['message' => 'No se encontraron registros jurídicos para este cliente'], 404);
        }

        return response()->json($juridicos);
    }

}
