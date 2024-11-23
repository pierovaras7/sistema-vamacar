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
        Schema::create('natural', function (Blueprint $table) {
            $table->id('idNatural');
            $table->string('nombres');
            $table->string('apellidos');
            $table->unsignedBigInteger('idCliente');
            $table->foreign('idCliente')
                    ->references('idCliente') 
                    ->on('cliente')
                    ->onDelete('restrict');
            $table->boolean('estado');  

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('natural');
    }
};
