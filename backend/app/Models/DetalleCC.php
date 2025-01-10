<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleCC extends Model
{
    use HasFactory;

    // Definir el nombre de la tabla en caso de que no siga la convención
    protected $table = 'detalles_CC';

    protected $primaryKey = 'idDetalleCC';

    // Definir los campos que pueden ser asignados de manera masiva
    protected $fillable = [
        'motivo', 
        'fecha', 
        'monto', 
        'saldo',
        'idCC'
    ];

    // Si no deseas que se maneje el campo 'timestamps' en tu tabla, lo desactivas aquí
    public $timestamps = false;

    // Definir la relación con la cuenta por cobrar
    public function cuentaPorCobrar()
    {
        return $this->belongsTo(CuentaPorCobrar::class, 'idCC');
    }
}
