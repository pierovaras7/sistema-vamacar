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
        Schema::create('representante', function (Blueprint $table) {
            $table->id('idRepresentante');
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('dni');
            $table->string('cargo');
            $table->string('telefono');
            $table->boolean('estado')->default(1);  
        });
    }
   /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('representante');
    }
};
