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
        Schema::create('detalle_venta', function (Blueprint $table) {
            $table->unsignedBigInteger('idVenta');
            $table->unsignedBigInteger('idProducto');

            $table->decimal('cantidad');
            $table->decimal('precio');
            $table->decimal('subtotal');
            $table->boolean('estado');

            $table->foreign('idVenta')
                ->references('idVenta')
                ->on('venta')
                ->onDelete('restrict');

            $table->foreign('idProducto')
                ->references('idProducto')
                ->on('producto')
                ->onDelete('restrict');

            $table->primary(['idVenta', 'idProducto']); 

        });
    }


    public function down(): void
    {
        Schema::dropIfExists('detalle_venta');
    }
};
