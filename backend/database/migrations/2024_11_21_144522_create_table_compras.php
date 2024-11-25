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
        Schema::create('compra', function (Blueprint $table) {
            $table->id('idCompra');
            $table->date('fechaPedido');
            $table->date('fechaRecibido');
            $table->date('fechaPago');
            $table->boolean('estado')->default(1);  
            $table->decimal('total');
            $table->unsignedBigInteger('idProveedor');
            $table->foreign('idProveedor')
                    ->references('idProveedor') 
                    ->on('proveedor')
                    ->onDelete('restrict');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compra');
    }
};
