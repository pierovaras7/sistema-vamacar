<?php

namespace App\Http\Controllers;

use App\Models\Sede;
use App\Models\Trabajador;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TrabajadorController extends Controller
{
    /**
     * Muestra una lista de trabajadores.
     */
    public function index()
    {
        //corregir
        $trabajadores = Trabajador::where("estado", "=", 1)->get();

        if ($trabajadores->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron trabajadores.'
            ], 404);
        }

        return response()->json($trabajadores, 200);
    }

    public function getAvailableSedes()
    {
        //corregir
        $sedes = Sede::where("estado", "=", 1)->get();

        if ($sedes->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron sedes.'
            ], 404);
        }

        return response()->json($sedes, 200);
    }

    /**
     * Almacena un nuevo trabajador.
     */
    public function store(Request $request)
    {
        // Definir las reglas de validación
        $rules = [
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'telefono' => 'required|string|min:9|max:9',  // Longitud exacta de 9 caracteres
            'sexo' => 'required|string|in:M,F',  // Solo M o F
            'direccion' => 'nullable|string|max:255',
            'dni' => 'required|string|min:8|max:8|unique:trabajador,dni|unique:users,username',  // Longitud exacta de 8 caracteres
            'area' => 'nullable|string|max:100',
            'fechaNacimiento' => 'required|date',
            'turno' => 'nullable|string|max:50',
            'salario' => 'required|numeric|min:0',
        ];
        
        $messages = [
            'nombres.required' => 'El nombre es obligatorio.',
            'nombres.string' => 'El nombre debe ser una cadena de texto.',
            'nombres.max' => 'El nombre no puede tener más de 255 caracteres.',
        
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'apellidos.string' => 'Los apellidos deben ser una cadena de texto.',
            'apellidos.max' => 'Los apellidos no pueden tener más de 255 caracteres.',
        
            'telefono.required' => 'El teléfono es obligatorio.',
            'telefono.string' => 'El teléfono debe ser una cadena de texto.',
            'telefono.min' => 'El teléfono debe tener exactamente 9 caracteres.',
            'telefono.max' => 'El teléfono debe tener exactamente 9 caracteres.',
        
            'sexo.required' => 'El sexo es obligatorio.',
            'sexo.string' => 'El sexo debe ser una cadena de texto.',
            'sexo.in' => 'El sexo debe ser M (Masculino) o F (Femenino).',
        
            'direccion.nullable' => 'La dirección es opcional.',
            'direccion.string' => 'La dirección debe ser una cadena de texto.',
            'direccion.max' => 'La dirección no puede tener más de 255 caracteres.',
        
            'dni.required' => 'El DNI es obligatorio.',
            'dni.string' => 'El DNI debe ser una cadena de texto.',
            'dni.min' => 'El DNI debe tener exactamente 8 caracteres.',
            'dni.max' => 'El DNI debe tener exactamente 8 caracteres.',
            'dni.unique' => 'Este DNI ya está registrado como trabajador o usuario.',
        
            'area.nullable' => 'El área es opcional.',
            'area.string' => 'El área debe ser una cadena de texto.',
            'area.max' => 'El área no puede tener más de 100 caracteres.',
        
            'fechaNacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'fechaNacimiento.date' => 'La fecha de nacimiento debe ser una fecha válida.',
        
            'turno.nullable' => 'El turno es opcional.',
            'turno.string' => 'El turno debe ser una cadena de texto.',
            'turno.max' => 'El turno no puede tener más de 50 caracteres.',
        
            'salario.required' => 'El salario es obligatorio.',
            'salario.numeric' => 'El salario debe ser un número.',
            'salario.min' => 'El salario debe ser mayor o igual a 0.',
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
            // Si la validación pasa, crear el trabajador
            $trabajador = Trabajador::create($validator->validated());
            $trabajador->estado = 1;
            $trabajador->save();

            // Obtener el ID del trabajador recién creado
            $idTrabajador = $trabajador->idTrabajador;

            if($request->crearCuenta){
                User::create([
                    'name' => $request->nombres,
                    'username' => $request->dni,
                    'password' => bcrypt($request->dni), // Encriptar la contraseña
                    'idTrabajador' => $idTrabajador
                ]);
            }

            return response()->json([
                'message' => 'Trabajador creado exitosamente.',
                'trabajador' => $trabajador
            ], 201);  // Código 201: Recurso creado
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el trabajador.',
                'error' => $e->getMessage()
            ], 500);  // Código 500: Error interno del servidor
        }
    }

    /**
     * Muestra los detalles de un trabajador específico.
     */
    public function show($id)
    {
        $trabajador = Trabajador::find($id);

        if (!$trabajador) {
            return response()->json([
                'message' => 'Trabajador no encontrado.'
            ], 404);  // Código 404: No encontrado
        }

        return response()->json($trabajador, 200);  // Código 200: OK
    }

    /**
     * Actualiza un trabajador existente.
     */
    public function update(Request $request, $id)
    {
        $trabajador = Trabajador::find($id);

        if (!$trabajador) {
            return response()->json([
                'message' => 'Trabajador no encontrado.'
            ], 404);  // Código 404: No encontrado
        }

        // Definir las reglas de validación para la actualización
        $rules = [
            'nombres' => 'required|string|max:255', // Obligatorio, máximo 255 caracteres
            'apellidos' => 'required|string|max:255', // Obligatorio, máximo 255 caracteres
            'telefono' => 'required|string|size:9', // Obligatorio, exactamente 9 caracteres
            'sexo' => 'required|string|in:M,F', // Obligatorio, debe ser 'M' o 'F'
            'direccion' => 'nullable|string|max:255', // Opcional, máximo 255 caracteres
            'dni' => 'required|string|size:8|unique:trabajador,dni,' . $trabajador->idTrabajador . ',idTrabajador', 
            // Obligatorio, exactamente 8 caracteres, único excepto para el registro actual
            'area' => 'nullable|string|max:100', // Opcional, máximo 100 caracteres
            'fechaNacimiento' => 'required|date', // Obligatorio, debe ser una fecha válida
            'turno' => 'nullable|string|max:50', // Opcional, máximo 50 caracteres
            'salario' => 'required|numeric|min:0', // Obligatorio, debe ser un número mayor o igual a 0
        ];
        

        $messages = [
            'nombres.required' => 'El campo nombres es obligatorio.',
            'nombres.string' => 'El campo nombres debe ser una cadena de texto.',
            'nombres.max' => 'El campo nombres no puede tener más de 255 caracteres.',
            
            'apellidos.required' => 'El campo apellidos es obligatorio.',
            'apellidos.string' => 'El campo apellidos debe ser una cadena de texto.',
            'apellidos.max' => 'El campo apellidos no puede tener más de 255 caracteres.',
            
            'telefono.required' => 'El campo teléfono es obligatorio.',
            'telefono.string' => 'El campo teléfono debe ser una cadena de texto.',
            'telefono.size' => 'El campo teléfono debe tener exactamente 9 caracteres.',
            
            'sexo.required' => 'El campo sexo es obligatorio.',
            'sexo.string' => 'El campo sexo debe ser una cadena de texto.',
            'sexo.in' => 'El campo sexo debe ser M (Masculino) o F (Femenino).',
            
            'direccion.string' => 'El campo dirección debe ser una cadena de texto.',
            'direccion.max' => 'El campo dirección no puede tener más de 255 caracteres.',
            
            'dni.required' => 'El campo DNI es obligatorio.',
            'dni.string' => 'El campo DNI debe ser una cadena de texto.',
            'dni.size' => 'El campo DNI debe tener exactamente 8 caracteres.',
            'dni.unique' => 'El campo DNI ya está en uso.',
            
            'area.string' => 'El campo área debe ser una cadena de texto.',
            'area.max' => 'El campo área no puede tener más de 100 caracteres.',
            
            'fechaNacimiento.required' => 'El campo fecha de nacimiento es obligatorio.',
            'fechaNacimiento.date' => 'El campo fecha de nacimiento debe ser una fecha válida.',
            
            'turno.string' => 'El campo turno debe ser una cadena de texto.',
            'turno.max' => 'El campo turno no puede tener más de 50 caracteres.',
            
            'salario.required' => 'El campo salario es obligatorio.',
            'salario.numeric' => 'El campo salario debe ser un número.',
            'salario.min' => 'El campo salario debe ser un número mayor o igual a 0.',
        ];
        
        // Crear el validador
        $validator = Validator::make($request->all(), $rules, $messages);

        // Comprobar si la validación falla
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error en la validación de datos.',
                'errors' => $validator->errors(),
            ], 422);  // Código 422: Unprocessable Entity
        }

        try {
            // Si la validación pasa, actualizar el trabajador
            $trabajador->update($validator->validated());

            return response()->json([
                'message' => 'Trabajador actualizado exitosamente.',
                'trabajador' => $trabajador
            ], 200);  // Código 200: OK
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el trabajador.',
                'error' => $e->getMessage()
            ], 500);  // Código 500: Error interno del servidor
        }
    }

    /**
     * Elimina un trabajador.
     */
    public function destroy($id)
    {
        $trabajador = Trabajador::find($id);

        if (!$trabajador) {
            return response()->json([
                'message' => 'Trabajador no encontrado.'
            ], 404);  // Código 404: No encontrado
        }

        try {
            // Eliminar el trabajador
            $trabajador->estado = 0;
            $trabajador->save();

            return response()->json([
                'message' => 'Trabajador eliminado correctamente.'
            ], 200);  // Código 200: OK
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el trabajador.',
                'error' => $e->getMessage()
            ], 500);  // Código 500: Error interno del servidor
        }
    }
}
