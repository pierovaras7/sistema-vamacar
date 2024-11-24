<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Permiso extends Model
{
    use HasFactory;

    protected $table = 'permiso';

    protected $primaryKey = 'idPermiso';

    public $timestamps = false;

    protected $fillable = [
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];
}
