<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsuarioHasRol extends Model
{
    use HasFactory;

    protected $table = 'usuario_has_rol';

    public $timestamps = false;

    public $incrementing = false; 

    protected $primaryKey = null;

    protected $fillable = [
        'idRol',
        'idUsuario',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'idRol', 'idRol');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'idUsuario', 'idUsuario');
    }


    protected function getKeyForSaveQuery()
    {
        $query = [];
        foreach (['idRol', 'idUsuario'] as $key) {
            $query[$key] = $this->getAttribute($key);
        }
        return $query;
    }
}
