<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\Compra;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\CuentaPorCobrar;
use Illuminate\Support\Facades\DB;

use App\Models\DetalleVenta;
use App\Models\CuentaPorPagar; // Si tienes este modelo
use Illuminate\Http\Request;
use Carbon\Carbon;

class IndicadoresController extends Controller
{
    // Ingreso por Ventas
    public function ingresoVentas()
    {
        $ingresoVentas = Venta::where('estado', true)
            ->sum('total'); // Suma el total de ventas
        return response()->json(['ingresoVentas' => $ingresoVentas]);
    }

    // Ingreso por Compras
    public function ingresoCompras()
    {
        $ingresoCompras = Compra::where('estado', true)
            ->sum('total'); // Suma el total de compras
        return response()->json(['ingresoCompras' => $ingresoCompras]);
    }



    public function ventasVsComprasUltimos5Meses()
    {
        $result = [];
        $now = Carbon::now()->startOfMonth(); // Inicio del mes actual
        for ($i = 1; $i <= 5; $i++) {
            $month = $now->subMonth(); // Retrocede un mes
            $ventas = Venta::whereYear('fecha', $month->year)
                ->whereMonth('fecha', $month->month)
                ->where('estado', true)
                ->sum('total');
            $compras = Compra::whereYear('fechaPedido', $month->year)
                ->whereMonth('fechaPedido', $month->month)
                ->where('estado', true)
                ->sum('total');
            $result[] = [
                'month' => $month->format('F Y'),
                'ventas' => $ventas,
                'compras' => $compras,
            ];
        }
        return response()->json($result);
    }
    // 5 productos más vendidos
    public function productosMasVendidos()
    {
        $productos = DetalleVenta::select('producto.idProducto', 'producto.descripcion', DB::raw('SUM(detalle_venta.cantidad) as total_cantidad'))
        ->join('producto', 'detalle_venta.idProducto', '=', 'producto.idProducto')
        ->join('venta', 'detalle_venta.idVenta', '=', 'venta.idVenta')
        ->where('venta.estado', true) // Considera solo ventas activas
        ->where('detalle_venta.estado', true) // Considera solo detalles activos
        ->groupBy('producto.idProducto', 'producto.descripcion') // Agrupa por producto
        ->orderByDesc('total_cantidad') // Ordena de mayor a menor
        ->take(10) // Limita a los 10 productos más vendidos
        ->get();

    return response()->json($productos);
    }

    // Marcas más vendidas
    public function marcasMasVendidas()
    {
        $marcas = Marca::selectRaw('marca.marca, SUM(detalle_venta.cantidad) as total_vendido')
            ->join('producto', 'producto.idMarca', '=', 'marca.idMarca')
            ->join('detalle_venta', 'detalle_venta.idProducto', '=', 'producto.idProducto')
            ->groupBy('marca.idMarca', 'marca.marca')
            ->orderByDesc('total_vendido')
            ->limit(5)
            ->get();
        
        return response()->json(['marcasMasVendidas' => $marcas]);
    }

    // Cuentas por Cobrar
    public function cuentasPorCobrar()
    {
        $cuentasPorCobrar = CuentaPorCobrar::sum('montoCuenta');
        return response()->json(['cuentasPorCobrar' => $cuentasPorCobrar]);
    }

    // Cuentas por Pagar (si tienes este modelo)
    public function cuentasPorPagar()
    {
        $cuentasPorPagar = CuentaPorPagar::sum('montoCuenta'); // Asegúrate de tener el modelo CuentaPorPagar
        return response()->json(['cuentasPorPagar' => $cuentasPorPagar]);
    }
}
