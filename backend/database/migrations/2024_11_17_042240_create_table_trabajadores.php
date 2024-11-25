<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trabajador', function (Blueprint $table) {
            $table->id('idTrabajador');
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('telefono');
            $table->char('sexo');
            $table->string('direccion');
            $table->string('dni');
            $table->string('area');
            $table->date('fechaNacimiento');
            $table->string('turno');
            $table->decimal('salario');
            $table->boolean('estado')->default(1);  
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trabajador');
    }
};
