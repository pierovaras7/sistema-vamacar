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
        Schema::create('inventario', function (Blueprint $table) {
            $table->id('idInventario');
            $table->decimal('stockMinimo');
            $table->decimal('stockActual');
            $table->unsignedBigInteger('idProducto');
            $table->foreign('idProducto')
                    ->references('idProducto') 
                    ->on('producto')
                    ->onDelete('restrict');
            $table->boolean('estado')->default(1);  
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventario');
    }
};
