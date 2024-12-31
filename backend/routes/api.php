<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\SubcategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\TrabajadorController;
use App\Http\Controllers\RepresentanteController;
use App\Http\Controllers\ProveedorController;


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


Route::group(['middleware' => 'auth:api'], function () {
    
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


    Route::get('/representantes', [RepresentanteController::class, 'index']); // Obtener todos los representantes
    Route::post('/representantes', [RepresentanteController::class, 'store']); // Crear un representante
    Route::get('/representantes/{id}', [RepresentanteController::class, 'show']); // Obtener un representante por ID
    Route::put('/representantes/{id}', [RepresentanteController::class, 'update']); // Actualizar un representante
    Route::delete('/representantes/{id}', [RepresentanteController::class, 'destroy']); // Eliminación lógica de un representante
    Route::get('/representantes/dni/{dni}', [RepresentanteController::class, 'getByDni']);


        Route::get('/proveedores', [ProveedorController::class, 'index']); // Obtener todos los proveedores activos
        Route::get('/proveedores/ruc/{ruc}', [ProveedorController::class, 'getByRuc']); // Obtener un proveedor por RUC (activo)
        Route::post('/proveedores', [ProveedorController::class, 'store']); // Crear un proveedor
        Route::put('/proveedores/{id}', [ProveedorController::class, 'update']); // Actualizar un proveedor
        Route::delete('/proveedores/{id}', [ProveedorController::class, 'destroy']); // Eliminación lógica de un proveedor
});