<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuentas_por_pagar', function (Blueprint $table) {
            $table->id("idCP");
            $table->float("montoPago");
            $table->unsignedBigInteger('idCompra');
            $table->boolean('estado')->default(0);  
            $table->foreign('idCompra')
                    ->references('idCompra') 
                    ->on('compra')
                    ->onDelete('restrict');
            $table->timestamps(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cuentas_por_cobrar');
    }
};
