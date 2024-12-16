<?php

namespace App\Http\Controllers;


use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;

class ModulosController extends Controller
{
    /**
     * Obtener la lista de todos los módulos.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $modules = Module::all(); // Obtener todos los módulos
        return response()->json($modules);
    }

    /**
     * Crear un nuevo módulo.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:modules,slug',
        ]);

        // Crear un nuevo módulo
        $module = Module::create([
            'name' => $request->name,
            'slug' => $request->slug,
        ]);

        return response()->json($module, 201); // Retornar el módulo creado
    }

    /**
     * Obtener los detalles de un módulo específico.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json(['message' => 'Módulo no encontrado'], 404);
        }

        return response()->json($module);
    }

    /**
     * Actualizar los datos de un módulo específico.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // Validar los datos de entrada
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:modules,slug,' . $id,
        ]);

        $module = Module::find($id);

        if (!$module) {
            return response()->json(['message' => 'Módulo no encontrado'], 404);
        }

        // Actualizar el módulo
        $module->update([
            'name' => $request->name,
            'slug' => $request->slug,
        ]);

        return response()->json($module);
    }

    /**
     * Eliminar un módulo específico.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json(['message' => 'Módulo no encontrado'], 404);
        }

        // Eliminar el módulo
        $module->delete();

        return response()->json(['message' => 'Módulo eliminado correctamente']);
    }
}
