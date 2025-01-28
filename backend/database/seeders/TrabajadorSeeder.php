<?php

namespace Database\Seeders;

use App\Models\Trabajador;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;


class TrabajadorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $faker = Faker::create();

        for ($i = 0; $i < 2; $i++) {
            Trabajador::create([
                'nombres' => $faker->firstName,
                'apellidos' => $faker->lastName,
                'telefono' => $faker->phoneNumber,
                'sexo' => $faker->randomElement(['Masculino', 'Femenino']),
                'direccion' => $faker->address,
                'dni' => $faker->unique()->numerify('########'),
                'area' => 'ATENCION',
                'fechaNacimiento' => $faker->date('Y-m-d', '2000-12-31'),
                'turno' => $faker->randomElement(['Mañana', 'Tarde', 'Noche']),
                'salario' => $faker->randomFloat(2, 1000, 3000),
                'estado' => $faker->boolean,
            ]);
        }
    }
}
