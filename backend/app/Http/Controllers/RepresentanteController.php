<?php

namespace App\Http\Controllers;

use App\Models\Representante;
use Illuminate\Http\Request;

class RepresentanteController extends Controller
{
    // Obtener todos los representantes activos
    public function index()
    {
        $representantes = Representante::where('estado', true)->get();
        return response()->json($representantes, 200);
    }

    // Obtener un representante por DNI (solo activos)
    public function getByDni($dni)
    {
        $representante = Representante::where('dni', $dni)->where('estado', true)->first();

        if (!$representante) {
            return response()->json(['message' => 'Representante no encontrado.'], 404);
        }

        return response()->json($representante, 200);
    }

    // Crear un nuevo representante
    public function store(Request $request)
    {
        $request->validate([
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'dni' => 'required|string|max:15',
            'cargo' => 'required|string|max:100',
            'telefono' => 'nullable|string|max:20',
        ]);

        $existingRepresentante = Representante::where('dni', $request->input('dni'))->first();

        if ($existingRepresentante) {
            if ($existingRepresentante->estado == true) {
                return response()->json(['message' => 'El DNI ya esta registrado.'], 400);
            }

            // Reactivar representante si está inactivo
            $existingRepresentante->estado = true;
            $existingRepresentante->save();

            return response()->json([
                'message' => 'Representante reactivado exitosamente.',
                'representante' => $existingRepresentante,
            ], 200);
        }

        // Crear un nuevo representante
        $representante = Representante::create(array_merge(
            $request->all(),
            ['estado' => true]
        ));

        return response()->json([
            'message' => 'Representante creado exitosamente.',
            'representante' => $representante,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $representante = Representante::find($id);
    
        if (!$representante || !$representante->estado) {
            return response()->json(['message' => 'Representante no encontrado o inactivo.'], 404);
        }
    
        // Validación de los campos que pueden ser actualizados
        $request->validate([
            'nombres' => 'sometimes|required|string|max:255',
            'apellidos' => 'sometimes|required|string|max:255',
            'dni' => 'sometimes|required|string|max:15' . $id . ',idRepresentante',
            'cargo' => 'sometimes|required|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'estado' => 'sometimes|required|boolean',
        ]);
    
        // Verificar si el DNI está siendo cambiado
        if ($request->has('dni') && $request->input('dni') !== $representante->dni) {
            $existingRepresentante = Representante::where('dni', $request->input('dni'))->first();
    
            if ($existingRepresentante) {
                if ($existingRepresentante->estado) {
                    return response()->json(['message' => 'El DNI ya está registrado y activo.'], 400);
                }
    
                // Reactivar el representante existente e inactivo
                $existingRepresentante->update(array_merge(
                    $request->all(),
                    ['estado' => true]  // Se reactiva al representante con el nuevo DNI
                ));
    
                return response()->json([
                    'message' => 'Representante reactivado y actualizado exitosamente.',
                    'representante' => $existingRepresentante,
                ], 200);
            }
        }
    
        // Actualizar el representante actual
        $representante->update($request->all());
    
        return response()->json([
            'message' => 'Representante actualizado exitosamente.',
            'representante' => $representante,
        ], 200);
    }
    

    // Eliminación lógica de un representante
    public function destroy($id)
    {
        $representante = Representante::find($id);

        if (!$representante || !$representante->estado) {
            return response()->json(['message' => 'Representante no encontrado.'], 404);
        }

        $representante->estado = false;
        $representante->save();

        return response()->json(['message' => 'Representante eliminado exitosamente.'], 200);
    }


    public function show($id)
    {
        $representante = Representante::find($id);

        if (!$representante) {
            return response()->json(['message' => 'Representante no encontrada.'], 404);
        }

        return response()->json($representante, 200);
    }

}
