<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'producto';

    protected $primaryKey = 'idProducto'; 

    public $timestamps = false; 

    protected $fillable = [
        'descripcion',
        'codigo',
        'uni_medida',
        'precioCosto',
        'precioMinVenta',
        'precioMaxVenta',
        'precioXMayor',
        'ubicacion',
        'idSubcategoria',
        'idMarca',
        'estado',
    ];

    protected $casts = [
        'precioCosto' => 'decimal:2',
        'precioMinVenta' => 'decimal:2',
        'precioMaxVenta' => 'decimal:2',
        'precioXMayor' => 'decimal:2',
        'estado' => 'boolean',
    ];


    // Relación con Inventario (supongamos que un producto tiene un inventario asociado)
    public function inventario()
    {
        return $this->hasOne(Inventario::class, 'idProducto');
    }

    public function subcategoria()
    {
        return $this->belongsTo(Subcategoria::class, 'idSubcategoria', 'idSubcategoria');
    }


    public function marca()
    {
        return $this->belongsTo(Marca::class, 'idMarca', 'idMarca');
    }
}
