<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $table = 'cliente';

    protected $primaryKey = 'idCliente';

    public $timestamps = false;

    protected $fillable = [
        'tipoCliente',
        'telefono',
        'correo',
        'direccion',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    // Relación con Natural
    public function natural()
    {
        return $this->hasOne(Natural::class, 'idCliente', 'idCliente');
    }

    // Relación con Juridico
    public function juridico()
    {
        return $this->hasOne(Juridico::class, 'idCliente', 'idCliente');
    }
}
