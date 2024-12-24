<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TrabajadorController;
use App\Http\Controllers\UsersController;
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
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::put('/perfil/{idUser}', [AuthController::class, 'updateProfile']);
    Route::post('/users/{user}/modules', [AuthController::class, 'assignModuleToUser']);
    Route::get('/users/{user}/modules', [AuthController::class, 'getUserModules']);

    Route::resource('trabajadores', TrabajadorController::class);
    Route::resource('users', UsersController::class);
    Route::get('modules', [UsersController::class, 'getAvailableModules']);
});

Route::resource('trabajadores', TrabajadorController::class);
// Route::put('/perfil/{idUser}', [AuthController::class, 'updateProfile']);

