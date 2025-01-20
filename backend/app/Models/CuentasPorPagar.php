<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CuentasPorPagar extends Model
{
    use HasFactory;

    protected $table = 'cuentas_por_pagar';

    protected $primaryKey = 'idCP';


    protected $fillable = [
        'idCompra', 
        'montoPago',
        'estado'
    ];

    public $timestamps = false;

    public function  compra()
    {
        return $this->belongsTo(Compra::class, 'idCompra');
    }
}
