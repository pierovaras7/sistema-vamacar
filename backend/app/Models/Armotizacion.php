<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Amortizacion extends Model
{
    use HasFactory;

    protected $table = 'amortizacion';

    protected $primaryKey = 'idAmortizacion'; 

    public $timestamps = false;

    protected $fillable = [
        'fecha',
        'monto',
        'metodoPago',
        'idVenta',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date', 
        'monto' => 'decimal:2', 
        'estado' => 'boolean',
    ];

    
    public function venta()
    {
        return $this->belongsTo(Venta::class, 'idVenta', 'idVenta');
    }
}
