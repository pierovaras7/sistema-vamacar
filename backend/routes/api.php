<?php

use App\Exports\SalesExport;
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
use App\Http\Controllers\CompraController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\IndicadoresController;


use App\Models\Cliente;
use Maatwebsite\Excel\Facades\Excel;

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
    Route::put('/updateProfile/{id}', [AuthController::class, 'updateProfile']);
    Route::get('/getUser/{id}', [AuthController::class, 'getUser']);
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
    Route::get('modules', [UsersController::class, 'getAvailableModules']);

    Route::post('/products/import', [ProductoController::class, 'import']);

    
    Route::resource('trabajadores', TrabajadorController::class);
    Route::get('sedes', [TrabajadorController::class, 'getAvailableSedes']);

    Route::resource('clientes', ClienteController::class);
    
    Route::get('findCliente/{valor}/{tipo}', [ClienteController::class, 'findCliente']);


    Route::resource('users', UsersController::class);
    Route::get('modules', [UsersController::class, 'getAvailableModules']);

    Route::resource('ventas', VentaController::class);
    Route::post('ventas/anular/{id}', [VentaController::class, 'anularVenta']);
    Route::get('exportarventas', [VentaController::class, 'exportVentas']); // Ruta para exportar las ventas
    // Route::get('exportarventas', function () {
    //     return response()->json(['message' => 'La ruta de exportación ha sido accedida correctamente.']);
    // });
    

    Route::resource('naturales', NaturalController::class);
    Route::resource('juridicos', JuridicoController::class);
    Route::resource('cuentascobrar', CuentasCobrarController::class);

    Route::resource('cuentascobrar', CuentasCobrarController::class);
    Route::post('cuentascobrar/registrarDetalleCC/{id}', [CuentasCobrarController::class, 'registrarDetalleCC']);

    Route::resource('inventarios', InventarioController::class);
    Route::post('inventarios/registrarMovInventario/{id}', [InventarioController::class, 'registrarMovInventario']);


    

    Route::get('/juridicos/cliente/{idCliente}', [JuridicoController::class, 'getByCliente']);
    Route::get('/naturales/cliente/{idCliente}', [NaturalController::class, 'getByCliente']);

    Route::get('/proveedores', [ProveedorController::class, 'index']);
    Route::post('/proveedores', [ProveedorController::class, 'store']);
    Route::get('/proveedores/{id}', [ProveedorController::class, 'show']);
    Route::put('/proveedores/{id}', [ProveedorController::class, 'update']);
    Route::delete('/proveedores/{id}', [ProveedorController::class, 'destroy']);
    Route::get('/proveedores/ruc/{ruc}', [ProveedorController::class, 'getByRuc']);
    Route::get('/proveedores/rs/{razonSocial}', [ProveedorController::class, 'getByRS']);


    Route::get('/compras', [CompraController::class, 'index']);
    Route::post('/compras', [CompraController::class, 'store']);
    Route::get('/compras/{id}', [CompraController::class, 'show']);
    Route::put('/compras/{id}', [CompraController::class, 'update']);
    Route::get('exportarcompras', [CompraController::class, 'exportCompras']);
  
    Route::post('compras/anular/{id}', [CompraController::class, 'anularCompra']);

    Route::get('/getEstado', [CompraController::class, 'getEstado']);
    Route::put('/updateEstado/{idCompra}', [CompraController::class, 'updateEstado']);
    Route::get('/cpp', [CompraController::class, 'getCuentasPorPagar']);

    Route::get('/ingreso-ventas', [IndicadoresController::class, 'ingresoVentas']);
    Route::get('/ingreso-compras', [IndicadoresController::class, 'ingresoCompras']);
    Route::get('/ventas-vs-compras-ultimos-5-meses', [IndicadoresController::class, 'ventasVsComprasUltimos5Meses']);
    Route::get('/productos-mas-vendidos', [IndicadoresController::class, 'productosMasVendidos']);
    Route::get('/marcas-mas-vendidas', [IndicadoresController::class, 'marcasMasVendidas']);
    Route::get('/cuentas-por-cobrar', [IndicadoresController::class, 'cuentasPorCobrar']);
    Route::get('/cuentas-por-pagar', [IndicadoresController::class, 'cuentasPorPagar']);

});