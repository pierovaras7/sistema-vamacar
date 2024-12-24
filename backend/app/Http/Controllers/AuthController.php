<?php
  
namespace App\Http\Controllers;
  
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validación de los datos de entrada
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            // 'email' => 'required|string|email|max:255|unique:users,email',
            'username' => 'required|string|max:20|unique:users,username',
            'password' => 'required|string|min:8|confirmed', // confirmación de contraseña
        ]);

        // Si la validación falla, retorna un error
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Crear un nuevo usuario
        $user = User::create([
            'name' => $request->name,
            // 'email' => $request->email,
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

        if ($token = JWTAuth::attempt($credentials)) {
            // Obtener el usuario autenticado
            $user = JWTAuth::user();
        
            // Cargar el trabajador relacionado
            $user->load('modules');

            $user->load('trabajador');
        
            // Crear la cookie HttpOnly para almacenar el token
            $cookie = cookie('token', $token, 60 * 24, '/', null, true, true); 
        
            $isAdmin = false;

            if($user->username == "admin"){
                $isAdmin = true;
            }
            // Retornar la respuesta con la cookie y la información del usuario
            return response()->json([
                'message' => 'Autenticación exitosa',
                'user' => $user, // Incluye los datos del usuario en la respuesta
                'isAdmin' => $isAdmin,
                'trabajador' => $user->trabajador, // Incluye los datos del trabajador
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

    public function updateProfile(Request $request, $idUser)
    {

        // Validación de los datos del request
        $validator = Validator::make($request->all(), [
            'username' => 'nullable|string|max:20|unique:users,username,' . $idUser . ',idUser',
            'password' => 'nullable|string|min:8|confirmed',
            'nombres' => 'nullable|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:15',
            'sexo' => 'nullable|in:M,F,SE',
            'direccion' => 'nullable|string|max:255',
            'dni' => 'nullable|string|max:10',
            'fechaNacimiento' => 'nullable|date',
        ]);
    
        

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }
    
        try {

        
            $user = User::findOrFail($idUser);
            // Actualizar datos del usuario

            $userData = $request->only(['username']);

            if (!empty($request->password)) {
                $userData['password'] = bcrypt($request->password);
            }

            $userData['name'] = $request->nombres . ' ' . $request->apellidos;

            $user->update($userData);
    
            // Actualizar o crear datos del trabajador asociado
            $trabajadorData = $request->only([
                'nombres',
                'apellidos',
                'telefono',
                'sexo',
                'direccion',
                'dni',
                'fechaNacimiento'
            ]);
            
            $user->trabajador->update($trabajadorData);

            // Retornar la respuesta exitosa
            return response()->json([
                'message' => 'Perfil y trabajador actualizados con éxito',
                'user' => $user->load('trabajador'),
             ], 200);
        } catch (\Exception $e) {
            Log::error('Error al actualizar perfil y trabajador: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar perfil y trabajador',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
}
