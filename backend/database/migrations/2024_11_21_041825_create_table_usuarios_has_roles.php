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
        Schema::create('usuario_has_rol', function (Blueprint $table) {
            $table->unsignedBigInteger('idRol');
            $table->unsignedBigInteger('idUser');
            $table->boolean('estado')->default(1);  
            $table->foreign('idRol')
                    ->references('idRol') 
                    ->on('rol')
                    ->onDelete('restrict');
            $table->foreign('idUser')
                    ->references('idUser') 
                    ->on('users')
                    ->onDelete('restrict');
            $table->primary(['idRol', 'idUser']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuario_has_rol');
    }
};
