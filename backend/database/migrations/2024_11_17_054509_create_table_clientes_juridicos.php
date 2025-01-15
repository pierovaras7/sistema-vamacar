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
            $table->string('representante');
            $table->foreign('idCliente')
                    ->references('idCliente') 
                    ->on('cliente')
                    ->onDelete('restrict'); 
            $table->boolean('estado')->default(1);  
         
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
