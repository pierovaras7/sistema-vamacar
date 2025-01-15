<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Representante extends Model
{
    use HasFactory;

    protected $table = 'representante';

    protected $primaryKey = 'idRepresentante';

    public $timestamps = false;

    protected $fillable = [
        'nombres',
        'apellidos',
        'dni',
        'cargo',
        'telefono',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];
}
