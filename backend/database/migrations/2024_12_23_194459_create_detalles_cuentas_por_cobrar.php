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
        Schema::create('detalles_CC', function (Blueprint $table) {
            $table->id("idDetalleCC");
            $table->string("motivo");
            $table->dateTime("fecha");
            $table->float("monto");
            $table->float("saldo");
            $table->unsignedBigInteger('idCC');
            $table->foreign('idCC')
                    ->references('idCC') 
                    ->on('cuentas_por_cobrar')
                    ->onDelete('restrict');
            $table->timestamps(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalles_CC');
    }
};
