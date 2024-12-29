<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TrabajadorController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\SubcategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\RepresentanteController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\NaturalController;
use App\Http\Controllers\JuridicoController;


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
    
    Route::get('/marcas', [MarcaController::class, 'index']);
    Route::post('/marcas', [MarcaController::class, 'store']);
    Route::get('/marcas/{id}', [MarcaController::class, 'show']);
    Route::put('/marcas/{id}', [MarcaController::class, 'update']);
    Route::delete('/marcas/{id}', [MarcaController::class, 'destroy']);

    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
    Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);

    Route::get('/subcategorias', [SubcategoriaController::class, 'index']);
    Route::post('/subcategorias', [SubcategoriaController::class, 'store']);
    Route::get('/subcategorias/{id}', [SubcategoriaController::class, 'show']);
    Route::put('/subcategorias/{id}', [SubcategoriaController::class, 'update']);
    Route::delete('/subcategorias/{id}', [SubcategoriaController::class, 'destroy']);
    Route::get('/subcategorias/categoria/{idCategoria}', [SubcategoriaController::class, 'getSubcategoriasByCategoria']);

    Route::get('/productos', [ProductoController::class, 'index']);
    Route::post('/productos', [ProductoController::class, 'store']);
    Route::get('/productos/{id}', [ProductoController::class, 'show']);
    Route::put('/productos/{id}', [ProductoController::class, 'update']);
    Route::delete('/productos/{id}', [ProductoController::class, 'destroy']);
    
    Route::resource('trabajadores', TrabajadorController::class);
    Route::resource('users', UsersController::class);
    Route::get('modules', [UsersController::class, 'getAvailableModules']);

    Route::get('/representantes', [RepresentanteController::class, 'index']);
    Route::post('/representantes', [RepresentanteController::class, 'store']);
    Route::get('/representantes/{id}', [RepresentanteController::class, 'show']);
    Route::put('/representantes/{id}', [RepresentanteController::class, 'update']);
    Route::delete('/representantes/{id}', [RepresentanteController::class, 'destroy']);



    Route::get('/clientes', [ClienteController::class, 'index']);
    Route::post('/clientes', [ClienteController::class, 'store']);
    Route::get('/clientes/{id}', [ClienteController::class, 'show']);
    Route::put('/clientes/{id}', [ClienteController::class, 'update']);
    Route::delete('/clientes/{id}', [ClienteController::class, 'destroy']);
    
    Route::get('/naturales', [NaturalController::class, 'index']);
    Route::post('/naturales', [NaturalController::class, 'store']);
    Route::get('/naturales/{id}', [NaturalController::class, 'show']);
    Route::put('/naturales/{id}', [NaturalController::class, 'update']);
    Route::delete('/naturales/{id}', [NaturalController::class, 'destroy']);
    
    Route::get('/juridicos', [JuridicoController::class, 'index']);
    Route::post('/juridicos', [JuridicoController::class, 'store']);
    Route::get('/juridicos/{id}', [JuridicoController::class, 'show']);
    Route::put('/juridicos/{id}', [JuridicoController::class, 'update']);
    Route::delete('/juridicos/{id}', [JuridicoController::class, 'destroy']);
    

});