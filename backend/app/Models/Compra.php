<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Compra extends Model
{
    use HasFactory;

    protected $table = 'compra';

    protected $primaryKey = 'idCompra'; 

    public $timestamps = false; 

    protected $fillable = [
        'fechaPedido',
        'fechaPago',
        'tipoCompra',
        'estado',
        'total',
        'idProveedor',
    ];

    protected $casts = [
        'fechaPedido' => 'date',
        'fechaRecibido' => 'date',
        'fechaPago' => 'date',
        'estado' => 'boolean',
        'total' => 'decimal:2', 
    ];


    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'idProveedor', 'idProveedor');
    }

    public function detalleCompra()
    {
        return $this->hasMany(DetalleCompra::class, 'idCompra', 'idCompra');
    }
}
