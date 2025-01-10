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
        Schema::create('cuentas_por_cobrar', function (Blueprint $table) {
            $table->id("idCC");
            $table->float("montoCuenta");
            $table->unsignedBigInteger('idCliente');
            $table->foreign('idCliente')
                    ->references('idCliente') 
                    ->on('cliente')
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
