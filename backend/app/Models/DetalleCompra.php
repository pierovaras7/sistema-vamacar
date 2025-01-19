<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DetalleCompra extends Model
{
    use HasFactory;

    protected $table = 'detalle_compra';

    public $incrementing = false;

    protected $primaryKey = null; 

    public $timestamps = false; // Desactiva timestamps automáticos


    protected $fillable = [
        'idCompra',
        'idProducto',
        'cantidad',
        'precioCosto',
        'subtotal',
        'estado',
    ];

    protected $casts = [
        'cantidad' => 'decimal:2',
        'precioCosto' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'estado' => 'boolean',
    ];

    public function compra()
    {
        return $this->belongsTo(Compra::class, 'idCompra', 'idCompra');
    }

    
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'idProducto', 'idProducto');
    }

    protected function getKeyForSaveQuery()
    {
        $query = [];
        foreach (['idCompra', 'idProducto'] as $key) {
            $query[$key] = $this->getAttribute($key);
        }
        return $query;
    }
}
