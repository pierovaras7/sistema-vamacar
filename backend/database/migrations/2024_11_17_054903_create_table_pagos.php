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
        Schema::create('pago', function (Blueprint $table) {
            $table->id('idPago');
            $table->decimal('monto');
            $table->date('fechaPago');
            $table->unsignedBigInteger('idTipoPago');
            $table->foreign('idTipoPago')
                    ->references('idTipoPago') 
                    ->on('tipopago')
                    ->onDelete('restrict');
            $table->unsignedBigInteger('idTrabajador');
            $table->foreign('idTrabajador')
                    ->references('idTrabajador') 
                    ->on('trabajador')
                    ->onDelete('restrict');
            $table->boolean('estado');  
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pago');
    }
};
