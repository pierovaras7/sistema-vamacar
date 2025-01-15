<?php

namespace App\Http\Controllers;

use App\Models\Natural;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NaturalController extends Controller
{
    public function index()
    {
        // Obtiene todos los registros de tipo Natural
        return response()->json(Natural::with('cliente')->get());
    }

    public function store(Request $request)
    {
        // Validación de datos
        $validator = Validator::make($request->all(), [
            'dni' => 'required|string|size:8|unique:natural,dni', // Validar que el dni sea único
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'idCliente' => 'required|exists:cliente,idCliente',
            'estado' => 'required|boolean',
        ], [
            'dni.unique' => 'El DNI ya está registrado.',
            'dni.size' => 'El DNI debe tener 8 caracteres.',
            'dni.required' => 'El campo DNI es obligatorio.',
            'nombres.required' => 'El campo nombres es obligatorio.',
            'nombres.string' => 'El campo nombres debe ser una cadena de texto.',
            'nombres.max' => 'El campo nombres no debe exceder los 255 caracteres.',
            'apellidos.required' => 'El campo apellidos es obligatorio.',
            'apellidos.string' => 'El campo apellidos debe ser una cadena de texto.',
            'apellidos.max' => 'El campo apellidos no debe exceder los 255 caracteres.',
            'idCliente.required' => 'El campo idCliente es obligatorio.',
            'idCliente.exists' => 'El cliente no existe.',
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
        // Validación de datos
        $validator = Validator::make($request->all(), [
            'dni' => 'required|string|size:8|unique:natural,dni,' . $id . ',idNatural',  // Validar que el dni sea único, exceptuando el registro actual
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'idCliente' => 'required|exists:cliente,idCliente',
            'estado' => 'required|boolean',
        ], [
            'dni.unique' => 'El DNI ya está registrado.',
            'dni.size' => 'El DNI debe tener 8 caracteres.',
            'dni.required' => 'El campo DNI es obligatorio.',
            'nombres.required' => 'El campo nombres es obligatorio.',
            'nombres.string' => 'El campo nombres debe ser una cadena de texto.',
            'nombres.max' => 'El campo nombres no debe exceder los 255 caracteres.',
            'apellidos.required' => 'El campo apellidos es obligatorio.',
            'apellidos.string' => 'El campo apellidos debe ser una cadena de texto.',
            'apellidos.max' => 'El campo apellidos no debe exceder los 255 caracteres.',
            'idCliente.required' => 'El campo idCliente es obligatorio.',
            'idCliente.exists' => 'El cliente no existe.',
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
