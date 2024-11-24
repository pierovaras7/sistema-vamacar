<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subcategoria extends Model
{
    use HasFactory;

    protected $table = 'subcategoria';

    protected $primaryKey = 'idSubcategoria'; 

    public $timestamps = false;

    protected $fillable = [
        'subcategoria',
        'idCategoria',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'idCategoria', 'idCategoria');
    }
}
