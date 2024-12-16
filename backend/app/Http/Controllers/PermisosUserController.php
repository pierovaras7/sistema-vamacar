<?php

namespace App\Http\Controllers;


use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Module;
use App\Models\User;
use Illuminate\Http\Request;


class PermisosUserController extends Controller
{
    /**
     * Obtiene los permisos de un usuario específico.
     *
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($userId)
    {
        $user = User::with('modules')->find($userId);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json([
            'user' => $user->only(['idUser', 'name', 'email']),
            'modules' => $user->modules,
        ]);
    }

    /**
     * Agrega o actualiza los permisos de un usuario.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $request->validate([
            'modules' => 'required|array',
            'modules.*' => 'exists:modules,id',
        ]);

        // Actualiza los permisos
        $user->modules()->sync($request->modules);

        return response()->json([
            'message' => 'Permisos actualizados correctamente',
            'modules' => $user->modules,
        ]);
    }

    /**
     * Elimina todos los permisos de un usuario.
     *
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        // Elimina todos los permisos
        $user->modules()->detach();

        return response()->json(['message' => 'Todos los permisos eliminados correctamente']);
    }
}
