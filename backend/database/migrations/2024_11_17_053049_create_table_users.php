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
        Schema::create('users', function (Blueprint $table) {
            $table->id('idUser'); // ID autoincremental
            $table->string('name'); // Nombre del usuario
            // $table->string('email')->nullable(); // Email único
            $table->string('username')->unique(); // Nombre del usuario
            $table->timestamp('email_verified_at')->nullable(); // Fecha de verificación de email
            $table->string('password'); // Contraseña
            $table->unsignedBigInteger('idTrabajador')->nullable();
            $table->foreign('idTrabajador')
                    ->references('idTrabajador') 
                    ->on('trabajador')
                    ->onDelete('restrict');
            $table->boolean('estado')->default(1);  
            $table->rememberToken(); // Token de "remember me" para sesiones persistentes
            $table->timestamps(); // Campos created_at y updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
