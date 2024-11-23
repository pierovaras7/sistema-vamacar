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
        Schema::create('producto', function (Blueprint $table) {
            $table->id('idProducto');
            $table->string('descripcion');
            $table->string('codigo')->unique();
            $table->string('uni_medida');
            $table->decimal('precioCosto');
            $table->decimal('precioMinVenta');
            $table->decimal('precioMaxVenta');
            $table->decimal('precioXMayor');
            $table->unsignedBigInteger('idSubcategoria');
            $table->unsignedBigInteger('idMarca');
            $table->foreign('idSubcategoria')
                    ->references('idSubcategoria') 
                    ->on('subcategoria')
                    ->onDelete('restrict');
            $table->foreign('idMarca')
                    ->references('idMarca') 
                    ->on('marca')
                    ->onDelete('restrict');
            $table->boolean('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producto');
    }
};
