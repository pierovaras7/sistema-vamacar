<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    use HasFactory;

    protected $table = 'pago';

    protected $primaryKey = 'idPago';

    public $timestamps = false;

    protected $fillable = [
        'monto',
        'fechaPago',
        'idTipoPago',
        'idTrabajador',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function tipoPago()
    {
        return $this->belongsTo(TipoPago::class, 'idTipoPago', 'idTipoPago');
    }

    public function trabajador()
    {
        return $this->belongsTo(Trabajador::class, 'idTrabajador', 'idTrabajador');
    }
}
