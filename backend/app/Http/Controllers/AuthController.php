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
            'username' => 'required|string|max:20',
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
            'username' => $request->username,
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
    $credentials = $request->only('username', 'password');

    // Intentar autenticar al usuario y generar el token JWT
    if ($token = JWTAuth::attempt($credentials)) {
        // Obtener el usuario autenticado mediante el token
        $user = JWTAuth::user(); // Obtener los datos del usuario desde el token

        // Crear la cookie HttpOnly para almacenar el token
        // 1 día de expiración, HttpOnly, Secure en producción
        $cookie = cookie('token', $token, 60 * 24, '/', null, true, true); 

        // Retornar la respuesta con la cookie y la información del usuario
        return response()->json([
            'message' => 'Autenticación exitosa',
            'user' => $user // Incluye los datos del usuario en la respuesta
        ])->cookie($cookie); // Se añade la cookie a la respuesta
    }

    // Si no se puede autenticar, devolver error 401
    return response()->json(['error' => 'Unauthorized'], 401);
}

public function logout(Request $request)
{
    try {
        // Intenta invalidar el token JWT
        $token = JWTAuth::getToken();
        if ($token) {
            JWTAuth::invalidate($token);
        } else {
            return response()->json(['message' => 'No token found'], 400);
        }

        // Elimina la cookie del token
        $cookie = cookie('token', null, -1); // Expiración pasada para eliminar la cookie

        // Responde con el mensaje de logout exitoso y la cookie eliminada
        return response()->json(['message' => 'Logout exitoso'])->cookie($cookie);
    } catch (\Exception $e) {
        // Registra el error en los logs
        Log::error('Error en logout: ' . $e->getMessage());

        // Devuelve una respuesta con el error
        return response()->json(['message' => 'Error al procesar el logout', 'error' => $e->getMessage()], 500);
    }
}
}
