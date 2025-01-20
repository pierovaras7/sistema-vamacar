<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    use HasFactory;

    protected $table = 'proveedor';

    protected $primaryKey = 'idProveedor';

    public $timestamps = false;

    protected $fillable = [
        'ruc',
        'razonSocial',
        'telefono',
        'correo',
        'direccion',
        'nombreRepresentante',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

}