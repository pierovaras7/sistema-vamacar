<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('detalle_compra', function (Blueprint $table) {
            $table->unsignedBigInteger('idCompra');
            $table->unsignedBigInteger('idProducto');
            $table->decimal('cantidad');
            $table->decimal('precioCosto');
            $table->decimal('subtotal');
            $table->boolean('estado')->default(1);  
            
            $table->foreign('idCompra')
                    ->references('idCompra') 
                    ->on('compra')
                    ->onDelete('restrict');
            $table->foreign('idProducto')
                    ->references('idProducto') 
                    ->on('producto')
                    ->onDelete('restrict');

            $table->primary(['idCompra', 'idProducto']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_compra');
    }
};
