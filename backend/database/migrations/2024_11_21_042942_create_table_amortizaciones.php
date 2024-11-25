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
        Schema::create('amortizacion', function (Blueprint $table) {
            $table->id('idAmortizacion');
            $table->date('fecha');
            $table->decimal('monto');
            $table->string('metodoPago');
            $table->unsignedBigInteger('idVenta');
            $table->foreign('idVenta')
                    ->references('idVenta') 
                    ->on('venta')
                    ->onDelete('restrict');
            $table->boolean('estado')->default(1);  
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('amortizacion');
    }
};
