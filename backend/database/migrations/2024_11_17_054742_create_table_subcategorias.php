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
        Schema::create('subcategoria', function (Blueprint $table) {
            $table->id('idSubcategoria');
            $table->string('subcategoria');
            $table->unsignedBigInteger('idCategoria');
            $table->foreign('idCategoria')
                    ->references('idCategoria') 
                    ->on('categoria')
                    ->onDelete('restrict');
            $table->boolean('estado');  
 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subcategoria');
    }
};
