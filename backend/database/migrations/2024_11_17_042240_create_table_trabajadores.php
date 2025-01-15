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
            $table->string('nombres')->nullable();
            $table->string('apellidos')->nullable();
            $table->string('telefono')->nullable();
            $table->char('sexo')->nullable();
            $table->string('direccion')->nullable();
            $table->string('dni')->unique()->nullable();
            $table->string('area')->nullable();
            $table->date('fechaNacimiento')->nullable();
            $table->string('turno')->nullable();
            $table->decimal('salario')->nullable();
            $table->unsignedBigInteger('idSede')->nullable();
            $table->foreign('idSede')
                    ->references('idSede') 
                    ->on('sede')
                    ->onDelete('restrict');
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
