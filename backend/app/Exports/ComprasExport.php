<?php

namespace App\Exports;

use App\Models\Compra;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Http\Request;

class ComprasExport implements FromCollection, WithHeadings
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
        return Compra::with(['proveedor', 'detalleCompra.producto'])
            ->when($this->fechaInicio && $this->fechaFin, function ($query) {
                return $query->whereBetween('fechaPedido', [$this->fechaInicio, $this->fechaFin]);
            })
            ->when($this->fechaInicio && !$this->fechaFin, function ($query) {
                return $query->where('fechaPedido', '>=', $this->fechaInicio);
            })
            ->when(!$this->fechaInicio && $this->fechaFin, function ($query) {
                return $query->where('fechaPedido', '<=', $this->fechaFin);
            })
            ->when(!$this->fechaInicio && !$this->fechaFin, function ($query) {
                return $query->where('fechaPedido', '>=', now()->subMonth());
            })
            ->orderBy('fechaPedido', 'desc')
            ->where("estado", true)
            ->get()
            ->map(function ($compra) {
                return [
                    'ID' => $compra->idCompra,
                    'Fecha Pedido' => $compra->fechaPedido,
                    'Proveedor' => $compra->proveedor->razonSocial ?? 'Proveedor desconocido',
                    'Total' => $compra->total,
                ];
            });
    }

    public function headings(): array
    {
        return ['ID', 'Fecha Pedido', 'Proveedor', 'Total'];
    }
}

