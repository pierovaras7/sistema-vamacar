<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Rol extends Model
{
    use HasFactory;

    protected $table = 'rol';

    protected $primaryKey = 'idRol';

    public $timestamps = false;

    protected $fillable = [
        'rol',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];
}
