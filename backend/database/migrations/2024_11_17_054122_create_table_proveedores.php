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
        Schema::create('proveedor', function (Blueprint $table) {
            $table->id('idProveedor');
            $table->string('ruc');
            $table->string('razonSocial');
            $table->string('telefono');
            $table->string('correo');
            $table->string('direccion');
            $table->unsignedBigInteger('idRepresentante');
            $table->foreign('idRepresentante')
                    ->references('idRepresentante') 
                    ->on('representante')
                    ->onDelete('restrict'); 
            $table->boolean('estado');  

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proveedor');
    }
};
