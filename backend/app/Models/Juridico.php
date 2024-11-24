<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Juridico extends Model
{
    use HasFactory;

    protected $table = 'juridico';

    protected $primaryKey = 'idJuridico'; 

    public $timestamps = false;

    protected $fillable = [
        'razonSocial',
        'ruc',
        'idCliente',
        'idRepresentante',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'idCliente', 'idCliente');
    }

    public function representante()
    {
        return $this->belongsTo(Representante::class, 'idRepresentante', 'idRepresentante');
    }
}
