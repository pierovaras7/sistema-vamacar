<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categoria';

    protected $primaryKey = 'idCategoria';

    public $timestamps = false;

    protected $fillable = [
        'categoria',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];
}
