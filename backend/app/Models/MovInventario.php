<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MovInventario extends Model
{
    use HasFactory;

    protected $table = 'movs_inventario';

    protected $primaryKey = 'idMovInventario';

    public $timestamps = false;

    protected $fillable = [
        'tipo',
        'descripcion',
        'fecha',
        'cantidad',
        'idInventario',
        'estado'
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];


}
