<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    //
    use HasFactory;

    protected $table = 'module';

    protected $primaryKey = 'idModule';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'slug',
        'icon'
    ];
}
