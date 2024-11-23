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
        Schema::create('detalle_compra', function (Blueprint $table) {
            $table->id('idDetalleVenta');
            $table->decimal('cantidad');
            $table->decimal('precioCosto');
            $table->decimal('subtotal');
            $table->unsignedBigInteger('idCompra');
            $table->unsignedBigInteger('idProducto');
            $table->foreign('idCompra')
                    ->references('idCompra') 
                    ->on('compra')
                    ->onDelete('restrict');
            $table->foreign('idProducto')
                    ->references('idProducto') 
                    ->on('producto')
                    ->onDelete('restrict');
            $table->boolean('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_compra');
    }
};
