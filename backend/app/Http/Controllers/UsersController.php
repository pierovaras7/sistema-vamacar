<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Trabajador;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UsersController extends Controller
{
    /**
     * Muestra una lista de trabajadores.
     */
    public function index()
    {
        $users = User::where("estado", "=", 1)->where("idUser","!=",1)->get();

        $users->load('modules');

        if ($users->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron usuarios.'
            ], 404);
        }

        return response()->json($users, 200);
    }

    public function getAvailableModules()
    {
        $modules = Module::all();

        if ($modules->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron modulos.'
            ], 404);
        }

        return response()->json($modules, 200);
    }

    /**
     * Almacena un nuevo trabajador.
     */
    public function store(Request $request)
    {
        // Definir las reglas de validación para los campos
        $rules = [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|string|min:8|confirmed', // Confirmación de la contraseña
        ];

        $messages = [
            'name.required' => 'El nombre es obligatorio.',
            'username.required' => 'El nombre de usuario es obligatorio.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
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
            
            // Crear el usuario asociado
            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'password' => bcrypt($request->password), // Hashear la contraseña
            ]);

            return response()->json([
                'message' => 'Usuario creado exitosamente.',
                'user' => $user,
            ], 201);  // Código 201: Recurso creado
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el usuario.',
                'error' => $e->getMessage()
            ], 500);  // Código 500: Error interno del servidor
        }
    }

    /**
     * Muestra los detalles de un trabajador específico.
     */
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'Usuario no encontrado.'
            ], 404);  // Código 404: No encontrado
        }

        return response()->json($user, 200);  // Código 200: OK
    }

    /**
     * Actualiza un trabajador existente.
     */
    public function update(Request $request, $id)
    {
        // Validar que el usuario existe
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'Usuario no encontrado.',
            ], 404);  // Código 404: Not Found
        }

        // Definir las reglas de validación para los campos
        $rules = [
            'name' => 'nullable|string|max:40',
            'username' => 'nullable|string|max:30|unique:users,username,' . $user->idUser . ',idUser',
            'password' => 'nullable|string|min:8', // La contraseña es opcional en la actualización
        ];

        $messages = [
            'name.max' => 'El nombre es no puede exceder los 40 caracteres.',
            'username.max' => 'El username no puede exceder los 30 caracteres.',
            'username.unique' => 'El username ya existe en el sistema, intente otra opcion.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
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
            // Iterar solo sobre los datos presentes en la solicitud y actualizarlos dinámicamente
            foreach ($request->all() as $key => $value) {
                if ($request->has($key) && in_array($key, ['name', 'username'])) { // Solo los campos permitidos
                    $user->{$key} = $value;
                }
            }

             // Verificar y actualizar la contraseña si es proporcionada
            if ($request->has('password') && $request->password) {
                $user->password = bcrypt($request->password);  // Encriptar la nueva contraseña
            }

            // Actualizar los módulos si se proporcionan
            if ($request->has('modules')) {
                // Asegurarse de que solo se envíen IDs de módulos
                $moduleIds = collect($request->modules)->pluck('idModule')->toArray();
                $user->modules()->sync($moduleIds);
            }

            // Guardar los cambios
            $user->save();

            return response()->json([
                'message' => 'Usuario actualizado exitosamente.',
            ], 200);  // Código 200: OK

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el usuario.',
                'error' => $e->getMessage()
            ], 500);  // Código 500: Error interno del servidor
        }
    }

    /**
     * Elimina un trabajador.
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'Usuario no encontrado.'
            ], 404);  // Código 404: No encontrado
        }

        try {
            // Eliminar el trabajador
            $user->estado = 0;
            $user->save();

            return response()->json([
                'message' => 'Usuario eliminado correctamente.'
            ], 200);  // Código 200: OK

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el usuario.',
                'error' => $e->getMessage()
            ], 500);  // Código 500: Error interno del servidor
        }
    }
}
