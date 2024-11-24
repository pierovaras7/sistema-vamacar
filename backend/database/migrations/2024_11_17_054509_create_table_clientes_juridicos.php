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
        Schema::create('juridico', function (Blueprint $table) {
            $table->id('idJuridico');
            $table->string('razonSocial');
            $table->string('ruc');
            $table->unsignedBigInteger('idCliente');
            $table->unsignedBigInteger('idRepresentante');
            $table->foreign('idCliente')
                    ->references('idCliente') 
                    ->on('cliente')
                    ->onDelete('restrict'); 
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
        Schema::dropIfExists('juridico');
    }
};
