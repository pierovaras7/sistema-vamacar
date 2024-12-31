<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventario extends Model
{
    use HasFactory;

    protected $table = 'inventario';

    protected $primaryKey = 'idInventario';

    public $timestamps = false;

    protected $fillable = [
        'stockMinimo',
        'stockActual',
        'idProducto',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'idProducto', 'idProducto');
    }

    public function movsInventario()
    {
        return $this->hasMany(MovInventario::class, 'idInventario', 'idInventario');
    }



}
