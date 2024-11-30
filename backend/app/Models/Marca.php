<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Marca extends Model
{
    use HasFactory;

    protected $table = 'marca';

    protected $primaryKey = 'idMarca';

    public $timestamps = false;

    protected $fillable = [
        'marca',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];
}
