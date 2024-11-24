<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    use HasFactory;

    protected $table = 'usuario';

    protected $primaryKey = 'idUsuario';

    public $timestamps = false;

    protected $fillable = [
        'user',
        'password',
        'correo',
        'fechaRegistro',
        'idTrabajador',
        'estado',
    ];

    protected $casts = [
        'fechaRegistro' => 'datetime',
        'estado' => 'boolean',
    ];


    public function trabajador()
    {
        return $this->belongsTo(Trabajador::class, 'idTrabajador', 'idTrabajador');
    }
}
