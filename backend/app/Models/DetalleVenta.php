<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleVenta extends Model
{
    use HasFactory;

    protected $table = 'detalle_venta';

    public $timestamps = false;

    public $incrementing = false; 

    protected $primaryKey = null; 

    protected $fillable = [
        'idVenta',
        'idProducto',
        'cantidad',
        'precio',
        'subtotal',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function venta()
    {
        return $this->belongsTo(Venta::class, 'idVenta', 'idVenta');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'idProducto', 'idProducto');
    }


    protected function getKeyForSaveQuery()
    {
        $query = [];
        foreach (['idVenta', 'idProducto'] as $key) {
            $query[$key] = $this->getAttribute($key);
        }
        return $query;
    }

}
