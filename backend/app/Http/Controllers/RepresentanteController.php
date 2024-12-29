<?php

namespace App\Http\Controllers;

use App\Models\Representante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RepresentanteController extends Controller
{
    /**
     * Muestra una lista de representantes.
     */
    public function index()
    {
        $representantes = Representante::where("estado", "=", 1)->get();

        if ($representantes->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron representantes.'
            ], 404);
        }

        return response()->json($representantes, 200);
    }

    /**
     * Almacena un nuevo representante.
     */
    public function store(Request $request)
    {
        // Definir las reglas de validación
        $rules = [
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'dni' => 'required|string|min:8|max:8|unique:representante,dni', // Longitud exacta de 8 caracteres
            'cargo' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:15',
            'estado' => 'required|boolean',  // Valor booleano
        ];

        $messages = [
            'nombres.required' => 'El nombre es obligatorio.',
            'nombres.string' => 'El nombre debe ser una cadena de texto.',
            'nombres.max' => 'El nombre no puede tener más de 255 caracteres.',
        
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'apellidos.string' => 'Los apellidos deben ser una cadena de texto.',
            'apellidos.max' => 'Los apellidos no pueden tener más de 255 caracteres.',
        
            'dni.required' => 'El DNI es obligatorio.',
            'dni.string' => 'El DNI debe ser una cadena de texto.',
            'dni.min' => 'El DNI debe tener exactamente 8 caracteres.',
            'dni.max' => 'El DNI debe tener exactamente 8 caracteres.',
            'dni.unique' => 'Este DNI ya está registrado.',
        
            'cargo.nullable' => 'El cargo es opcional.',
            'cargo.string' => 'El cargo debe ser una cadena de texto.',
            'cargo.max' => 'El cargo no puede tener más de 255 caracteres.',
        
            'telefono.nullable' => 'El teléfono es opcional.',
            'telefono.string' => 'El teléfono debe ser una cadena de texto.',
            'telefono.max' => 'El teléfono no puede tener más de 15 caracteres.',
        
            'estado.required' => 'El estado es obligatorio.',
            'estado.boolean' => 'El estado debe ser un valor booleano.',
        ];

        // Crear el validador
        $validator = Validator::make($request->all(), $rules, $messages);

        // Comprobar si la validación falla
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error en la validación de datos.',
                'errors' => $validator->errors()
            ], 422);  // Código 422: Unprocessable Entity
        }

        try {
            // Si la validación pasa, crear el representante
            $representante = Representante::create($validator->validated());

            return response()->json([
                'message' => 'Representante creado exitosamente.',
                'representante' => $representante
            ], 201);  // Código 201: Recurso creado
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el representante.',
                'error' => $e->getMessage()
            ], 500);  // Código 500: Error interno del servidor
        }
    }

    /**
     * Muestra los detalles de un representante específico.
     */
    public function show($id)
    {
        $representante = Representante::find($id);

        if (!$representante) {
            return response()->json([
                'message' => 'Representante no encontrado.'
            ], 404);  // Código 404: No encontrado
        }

        return response()->json($representante, 200);  // Código 200: OK
    }

    /**
     * Actualiza un representante existente.
     */
    public function update(Request $request, $id)
    {
        $representante = Representante::find($id);

        if (!$representante) {
            return response()->json([
                'message' => 'Representante no encontrado.'
            ], 404);  // Código 404: No encontrado
        }

        // Definir las reglas de validación para la actualización
        $rules = [
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'dni' => 'required|string|min:8|max:8|unique:representante,dni,' . $representante->idRepresentante . ',idRepresentante',
            'cargo' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:15',
            'estado' => 'required|boolean',
        ];

        $messages = [
            'nombres.required' => 'El nombre es obligatorio.',
            'nombres.string' => 'El nombre debe ser una cadena de texto.',
            'nombres.max' => 'El nombre no puede tener más de 255 caracteres.',
        
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'apellidos.string' => 'Los apellidos deben ser una cadena de texto.',
            'apellidos.max' => 'Los apellidos no pueden tener más de 255 caracteres.',
        
            'dni.required' => 'El DNI es obligatorio.',
            'dni.string' => 'El DNI debe ser una cadena de texto.',
            'dni.min' => 'El DNI debe tener exactamente 8 caracteres.',
            'dni.max' => 'El DNI debe tener exactamente 8 caracteres.',
            'dni.unique' => 'Este DNI ya está registrado.',
        
            'cargo.nullable' => 'El cargo es opcional.',
            'cargo.string' => 'El cargo debe ser una cadena de texto.',
            'cargo.max' => 'El cargo no puede tener más de 255 caracteres.',
        
            'telefono.nullable' => 'El teléfono es opcional.',
            'telefono.string' => 'El teléfono debe ser una cadena de texto.',
            'telefono.max' => 'El teléfono no puede tener más de 15 caracteres.',
        
            'estado.required' => 'El estado es obligatorio.',
            'estado.boolean' => 'El estado debe ser un valor booleano.',
        ];

        // Crear el validador
        $validator = Validator::make($request->all(), $rules, $messages);

        // Comprobar si la validación falla
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error en la validación de datos.',
                'errors' => $validator->errors()
            ], 422);  // Código 422: Unprocessable Entity
        }

        try {
            // Si la validación pasa, actualizar el representante
            $representante->update($validator->validated());

            return response()->json([
                'message' => 'Representante actualizado exitosamente.',
                'representante' => $representante
            ], 200);  // Código 200: OK
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el representante.',
                'error' => $e->getMessage()
            ], 500);  // Código 500: Error interno del servidor
        }
    }

    /**
     * Elimina un representante.
     */
    public function destroy($id)
    {
        $representante = Representante::find($id);

        if (!$representante) {
            return response()->json([
                'message' => 'Representante no encontrado.'
            ], 404);  // Código 404: No encontrado
        }

        try {
            // Eliminar el representante
            $representante->estado = 0;
            $representante->save();

            return response()->json([
                'message' => 'Representante eliminado correctamente.'
            ], 200);  // Código 200: OK
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el representante.',
                'error' => $e->getMessage()
            ], 500);  // Código 500: Error interno del servidor
        }
    }
}
