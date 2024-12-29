<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    use HasFactory;

    protected $table = 'venta';

    protected $primaryKey = 'idVenta';

    public $timestamps = false;

    protected $fillable = [
        'fecha',
        'total',
        'montoPagado',
        'tipoVenta',
        'metodoPago',
        'idTrabajador',
        'idSede',
        'idCliente',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function trabajador()
    {
        return $this->belongsTo(Trabajador::class, 'idTrabajador', 'idTrabajador');
    }

    public function sede()
    {
        return $this->belongsTo(Sede::class, 'idSede', 'idSede');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'idCliente', 'idCliente');
    }
}
