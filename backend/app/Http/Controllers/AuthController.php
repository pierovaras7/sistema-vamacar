<?php
  
namespace App\Http\Controllers;
  
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validación de los datos de entrada
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed', // confirmación de contraseña
        ]);

        // Si la validación falla, retorna un error
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Crear un nuevo usuario
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password), // Encriptar la contraseña
        ]);

        // Generar un token JWT para el usuario recién registrado
        $token = JWTAuth::fromUser($user);

        // Retornar el token como respuesta
        return response()->json(['token' => $token]);
    }
    
    public function login(Request $request)
    {
        // Obtener las credenciales del request
        $credentials = $request->only('email', 'password');

        // Verificar si las credenciales son válidas y generar el token
        if ($token = JWTAuth::attempt($credentials)) {
            // El token se generó correctamente
            return response()->json([
                'token' => $token
            ]);
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }

}
