<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CuentaPorCobrar extends Model
{
    use HasFactory;

    // Definir el nombre de la tabla en caso de que no siga la convención
    protected $table = 'cuentas_por_cobrar';

    protected $primaryKey = 'idCC';


    // Definir los campos que pueden ser asignados de manera masiva
    protected $fillable = [
        'idCliente', 
        'montoCuenta',
    ];

    // Si no deseas que se maneje el campo 'timestamps' en tu tabla, lo desactivas aquí
    public $timestamps = false;

    // Definir la relación con el cliente
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'idCliente');
    }

    // Relación con los detalles de la cuenta por cobrar
    public function detalles()
    {
        return $this->hasMany(DetalleCC::class, 'idCC');
    }
}
