<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Natural extends Model
{
    use HasFactory;

    protected $table = 'natural';

    protected $primaryKey = 'idNatural';

    public $timestamps = false;

    protected $fillable = [
        'nombres',
        'apellidos',
        'idCliente',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'idCliente', 'idCliente');
    }
}
