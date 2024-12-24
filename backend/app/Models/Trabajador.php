<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Trabajador extends Model
{
    use HasFactory;

    protected $table = 'trabajador';

    protected $primaryKey = 'idTrabajador';

    public $timestamps = false;

    protected $fillable = [
        'nombres',
        'apellidos',
        'telefono',
        'sexo',
        'direccion',
        'dni',
        'area',
        'fechaNacimiento',
        'turno',
        'salario',
        'estado',
    ];

    protected $casts = [
        'fechaNacimiento' => 'date',
        'salario' => 'decimal:2',
        'estado' => 'boolean',
    ];
}
