<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TrabajadorController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\SubcategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\CuentasCobrarController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\NaturalController;
use App\Http\Controllers\JuridicoController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\IndicadoresController;

Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Route::group(['middleware' => ['api', 'auth:api']], function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::put('/updateProfile/{id}', [AuthController::class, 'updateProfile']);
    Route::get('/getUser/{id}', [AuthController::class, 'getUser']);
    Route::get('/refresh', [AuthController::class, 'refresh']);

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
    Route::get('modules', [UsersController::class, 'getAvailableModules']);
    
    Route::resource('trabajadores', TrabajadorController::class);
    Route::get('sedes', [TrabajadorController::class, 'getAvailableSedes']);

    Route::resource('clientes', ClienteController::class);
    Route::get('findCliente/{valor}', [ClienteController::class, 'findCliente']);


    Route::resource('users', UsersController::class);
    Route::get('modules', [UsersController::class, 'getAvailableModules']);

    Route::resource('ventas', VentaController::class);
    Route::post('ventas/anular/{id}', [VentaController::class, 'anularVenta']);

    Route::resource('naturales', NaturalController::class);
    Route::resource('juridicos', JuridicoController::class);
    Route::resource('cuentascobrar', CuentasCobrarController::class);

    Route::resource('cuentascobrar', CuentasCobrarController::class);
    Route::post('cuentascobrar/registrarDetalleCC/{id}', [CuentasCobrarController::class, 'registrarDetalleCC']);

    Route::resource('inventarios', InventarioController::class);
    Route::post('inventarios/registrarMovInventario/{id}', [InventarioController::class, 'registrarMovInventario']);


    

    Route::get('/juridicos/cliente/{idCliente}', [JuridicoController::class, 'getByCliente']);
    Route::get('/naturales/cliente/{idCliente}', [NaturalController::class, 'getByCliente']);


    Route::get('/proveedores', [ProveedorController::class, 'index']); // Obtener todos los proveedores activos
    Route::get('/proveedores/ruc/{ruc}', [ProveedorController::class, 'getByRuc']); // Obtener un proveedor por RUC (activo)
    Route::post('/proveedores', [ProveedorController::class, 'store']); // Crear un proveedor
    Route::put('/proveedores/{id}', [ProveedorController::class, 'update']); // Actualizar un proveedor
    Route::delete('/proveedores/{id}', [ProveedorController::class, 'destroy']); // Eliminación lógica de un proveedor

// });

Route::get('/ingreso-ventas', [IndicadoresController::class, 'ingresoVentas']);
Route::get('/ingreso-compras', [IndicadoresController::class, 'ingresoCompras']);
Route::get('/ventas-vs-compras-ultimos-5-meses', [IndicadoresController::class, 'ventasVsComprasUltimos5Meses']);
Route::get('/productos-mas-vendidos', [IndicadoresController::class, 'productosMasVendidos']);
Route::get('/marcas-mas-vendidas', [IndicadoresController::class, 'marcasMasVendidas']);
Route::get('/cuentas-por-cobrar', [IndicadoresController::class, 'cuentasPorCobrar']);
Route::get('/cuentas-por-pagar', [IndicadoresController::class, 'cuentasPorPagar']); 