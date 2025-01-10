<?php

namespace App\Http\Controllers;

use App\Models\Juridico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JuridicoController extends Controller
{
    public function index()
    {
        // Obtiene todos los registros de tipo Juridico
        return response()->json(Juridico::with('cliente')->get());
    }

    public function store(Request $request)
    {
        // Validación de datos
        $validator = Validator::make($request->all(), [
            'razonSocial' => 'required|string|max:255',
            'ruc' => 'required|string|max:11|unique:juridico,ruc', // Validar que el RUC sea único
            'idCliente' => 'required|exists:cliente,idCliente',
            'representante' => 'required|string|max:255',
            'estado' => 'required|boolean',
        ], [
            'razonSocial.required' => 'El campo razón social es obligatorio.',
            'razonSocial.string' => 'El campo razón social debe ser una cadena de texto.',
            'razonSocial.max' => 'El campo razón social no debe exceder los 255 caracteres.',
            'ruc.required' => 'El campo RUC es obligatorio.',
            'ruc.string' => 'El campo RUC debe ser una cadena de texto.',
            'ruc.max' => 'El campo RUC no debe exceder los 15 caracteres.',
            'ruc.unique' => 'El RUC ya está registrado.',
            'idCliente.required' => 'El campo idCliente es obligatorio.',
            'idCliente.exists' => 'El cliente no existe.',
            'representante.required' => 'El campo representante es obligatorio.',
            'representante.string' => 'El campo representante debe ser una cadena de texto.',
            'representante.max' => 'El campo representante no debe exceder los 255 caracteres.',
            'estado.required' => 'El campo estado es obligatorio.',
            'estado.boolean' => 'El campo estado debe ser un valor booleano.',
        ]);

        // Comprobar si la validación falla
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error en la validación de datos.',
                'errors' => $validator->errors(),
            ], 422);  // Código 422: Unprocessable Entity
        }

        // Crea un nuevo registro de Jurídico
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
        // Validación de datos
        $validator = Validator::make($request->all(), [
            'razonSocial' => 'required|string|max:255',
            'ruc' => 'required|string|max:15|unique:juridico,ruc,' . $id . ',idJuridico', // Validar que el RUC sea único, exceptuando el registro actual
            'idCliente' => 'required|exists:cliente,idCliente',
            'representante' => 'required|string|max:255',
            'estado' => 'required|boolean',
        ], [
            'razonSocial.required' => 'El campo razón social es obligatorio.',
            'razonSocial.string' => 'El campo razón social debe ser una cadena de texto.',
            'razonSocial.max' => 'El campo razón social no debe exceder los 255 caracteres.',
            'ruc.required' => 'El campo RUC es obligatorio.',
            'ruc.string' => 'El campo RUC debe ser una cadena de texto.',
            'ruc.max' => 'El campo RUC no debe exceder los 15 caracteres.',
            'ruc.unique' => 'El RUC ya está registrado.',
            'idCliente.required' => 'El campo idCliente es obligatorio.',
            'idCliente.exists' => 'El cliente no existe.',
            'representante.required' => 'El campo representante es obligatorio.',
            'representante.string' => 'El campo representante debe ser una cadena de texto.',
            'representante.max' => 'El campo representante no debe exceder los 255 caracteres.',
            'estado.required' => 'El campo estado es obligatorio.',
            'estado.boolean' => 'El campo estado debe ser un valor booleano.',
        ]);

        // Comprobar si la validación falla
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error en la validación de datos.',
                'errors' => $validator->errors(),
            ], 422);  // Código 422: Unprocessable Entity
        }

        $juridico = Juridico::find($id);

        if (!$juridico) {
            return response()->json(['message' => 'Jurídico no encontrado'], 404);
        }

        // Actualiza el registro de Jurídico
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
