<?php

namespace App\Exports;

use App\Models\Venta;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class VentasExport implements FromCollection, WithHeadings
{
    protected $fechaInicio;
    protected $fechaFin;

    public function __construct($fechaInicio, $fechaFin)
    {
        $this->fechaInicio = $fechaInicio;
        $this->fechaFin = $fechaFin;
    }

    public function collection()
    {
        // Lógica de la consulta filtrando por fechas
        $query = Venta::with([
            'trabajador',
            'detalles.producto',
            'sede',
            'cliente' => function ($query) {
                $query->with(['natural', 'juridico']);
            }
        ])->where("estado", true);

        if ($this->fechaInicio && $this->fechaFin) {
            $query->whereBetween('fecha', [$this->fechaInicio, $this->fechaFin]);
        } elseif ($this->fechaInicio) {
            $query->where('fecha', '>=', $this->fechaInicio);
        } elseif ($this->fechaFin) {
            $query->where('fecha', '<=', $this->fechaFin);
        }

        $ventas = $query->orderBy('fecha', 'desc')->get();

        return $ventas->map(function ($venta) {
            return [
                'id' => $venta->idVenta,
                'fecha' => $venta->fecha,
                'trabajador' => $venta->trabajador->nombre ?? 'Administrador',
                'sede' => $venta->sede->direccion ?? '',
                'total' => $venta->total,
                'cliente' => ($venta->cliente->natural->nombres ?? '') . " " . ($venta->cliente->natural->apellidos ?? '') 
            ?: ($venta->cliente->juridico->razonSocial ?? ''),
                'tipo' => $venta->tipoVenta,
                'metodoPago' => $venta->metodoPago
            ];
        });
    }

    public function headings(): array
    {
        return ['ID', 'Fecha', 'Trabajador', 'Sede', 'Total' ,'Cliente', 'Tipo Venta', 'Metodo Pago'];
    }
}
