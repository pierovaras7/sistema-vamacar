<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PermisosUserController;
use App\Http\Controllers\ModulosController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api')->name('logout');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:api')->name('refresh');
    Route::post('/me', [AuthController::class, 'me'])->middleware('auth:api')->name('me');
});

Route::get('/users', [AuthController::class, 'getUsers']);

Route::group([
    'middleware' => 'api',
    'prefix' => 'permissions'
], function () {
    Route::get('/{userId}', [PermisosUserController::class, 'index'])->name('permissions.index'); // Obtener permisos de un usuario
    Route::post('/{userId}', [PermisosUserController::class, 'store'])->name('permissions.store'); // Agregar/actualizar permisos
    Route::delete('/{userId}', [PermisosUserController::class, 'destroy'])->name('permissions.destroy'); // Eliminar permisos
});


Route::prefix('modules')->middleware('api')->group(function () {
    Route::get('/', [ModulosController::class, 'index']); // Obtener todos los módulos
    Route::post('/', [ModulosController::class, 'store']); // Crear un nuevo módulo
    Route::get('/{id}', [ModulosController::class, 'show']); // Obtener un módulo específico
    Route::put('/{id}', [ModulosController::class, 'update']); // Actualizar un módulo
    Route::delete('/{id}', [ModulosController::class, 'destroy']); // Eliminar un módulo
});