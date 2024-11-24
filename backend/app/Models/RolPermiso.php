<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolPermiso extends Model
{
    use HasFactory;

    protected $table = 'rol_permiso';

    public $timestamps = false;

    public $incrementing = false; 

    protected $primaryKey = null; 

    protected $fillable = [
        'idRol',
        'idPermiso',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];


    public function rol()
    {
        return $this->belongsTo(Rol::class, 'idRol', 'idRol');
    }


    public function permiso()
    {
        return $this->belongsTo(Permiso::class, 'idPermiso', 'idPermiso');
    }


    protected function getKeyForSaveQuery()
    {
        $query = [];
        foreach (['idRol', 'idPermiso'] as $key) {
            $query[$key] = $this->getAttribute($key);
        }
        return $query;
    }
}
