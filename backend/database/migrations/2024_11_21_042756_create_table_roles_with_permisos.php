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
        Schema::create('rol_permiso', function (Blueprint $table) {
            $table->unsignedBigInteger('idRol');
            $table->unsignedBigInteger('idPermiso');
            $table->boolean('estado')->default(1);  
            $table->foreign('idRol')
                    ->references('idRol') 
                    ->on('rol')
                    ->onDelete('restrict');
            $table->foreign('idPermiso')
                    ->references('idPermiso') 
                    ->on('permiso')
                    ->onDelete('restrict');
            $table->primary(['idRol', 'idPermiso']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rol_permiso');
    }
};
