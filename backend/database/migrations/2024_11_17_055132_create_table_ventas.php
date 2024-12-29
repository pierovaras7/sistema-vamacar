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
        Schema::create('venta', function (Blueprint $table) {
            $table->id('idVenta');
            $table->date('fecha');
            $table->decimal('total');
            $table->decimal('montoPagado');
            $table->string('tipoVenta');
            $table->string('metodoPago');
            $table->unsignedBigInteger('idTrabajador');
            $table->unsignedBigInteger('idSede');
            $table->unsignedBigInteger('idCliente');

            $table->foreign('idTrabajador')
                    ->references('idTrabajador') 
                    ->on('trabajador')
                    ->onDelete('restrict');

            $table->foreign('idSede')
                    ->references('idSede') 
                    ->on('sede')
                    ->onDelete('restrict');
            
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
        Schema::dropIfExists('venta');
    }
};
