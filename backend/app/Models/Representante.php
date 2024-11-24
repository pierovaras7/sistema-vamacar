<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
