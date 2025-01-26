<?php
  
namespace App\Http\Controllers;
  
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
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
        
            // Verificar que el usuario esté activo (estado != 0)
            if ($user->estado == 0) {
                return response()->json(['error' => 'Usuario inactivo.'], 403);  // Error 403: Forbidden
            }

            $user->load(['modules', 'trabajador.sede']);

            // Crear la cookie HttpOnly para almacenar el token
            $cookie = cookie('token', $token, 1, '/', null, true, true);
        
            $isAdmin = $user->isAdmin;
            // Retornar la respuesta con la cookie y la información del usuario
            return response()->json([
                'message' => 'Autenticación exitosa',
                'user' => $user, // Incluye los datos del usuario en la respuesta
                'isAdmin' => $isAdmin,
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
        ], [
            'username.unique' => 'El nombre de usuario ya está en uso, por favor elige otro.',
            'username.max' => 'El nombre de usuario no puede tener más de 20 caracteres.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'nombres.max' => 'El campo de nombres no puede tener más de 255 caracteres.',
            'apellidos.max' => 'El campo de apellidos no puede tener más de 255 caracteres.',
            'telefono.max' => 'El número de teléfono no puede tener más de 15 caracteres.',
            'sexo.in' => 'El sexo debe ser uno de los siguientes: M, F, SE.',
            'direccion.max' => 'La dirección no puede tener más de 255 caracteres.',
            'dni.max' => 'El DNI no puede tener más de 10 caracteres.',
            'fechaNacimiento.date' => 'La fecha de nacimiento debe tener un formato válido.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }


        try {
            $user = User::findOrFail($idUser);

            // Verificar si el usuario es el administrador con id = 1
            $isAdmin = $user->isAdmin;

            // Si el usuario es admin, solo permitimos la actualización de 'username' y 'password'
            $userData = $request->only(['username']);

            // Si se proporciona una nueva contraseña, actualizarla
            if (!empty($request->password)) {
                $userData['password'] = bcrypt($request->password);
            }
            
            // Si el usuario no es admin, podemos actualizar también los campos 'name' (nombres y apellidos)
            if (!$isAdmin && !empty($request->nombres) && !empty($request->apellidos)) {
                $userData['name'] = $request->nombres . ' ' . $request->apellidos;
            }

            // Actualizar los datos del usuario
            $user->update($userData);

            // Verificar si el usuario tiene un trabajador asociado
            if ($user->trabajador) {
                // Actualizar los datos del trabajador si existen
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
            }

            // Retornar la respuesta exitosa
            return response()->json([
                'message' => 'Perfil actualizado con éxito' . ($user->trabajador ? ' y trabajador' : ''),
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

    public function getUser($idUser)
    {
        try {
            $user = User::findOrFail($idUser);

            // Verificar si el usuario está autenticado
            if (!$user) {
                return response()->json(['message' => 'Usuario no encontrado'], 401);
            }

            $user->load(['modules', 'trabajador.sede']);
            
            return response()->json([
                'user' => $user,
                'message' => 'Usuario autenticado exitosamente',
            ], 200);
        } catch (\Exception $e) {
            // En caso de error, capturamos la excepción y la mostramos
            return response()->json([
                'message' => 'Error al obtener el usuario autenticado',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function refresh()
    {
        try {
            // Obtener el token desde la cookie
            $currentToken = JWTAuth::getToken(); // Intenta obtenerlo desde el header

            if (!$currentToken) {
                $currentToken = Cookie::get('token'); // Intenta obtenerlo desde las cookies
            }
            
            if (!$currentToken) {
                return response()->json(['message' => 'Token no encontrado'], 400);
            }

            if (!$currentToken) {
                return response()->json([
                    'message' => 'Token no proporcionado'
                ], 401);
            }


            $newToken = JWTAuth::refresh($currentToken);

            // Obtener el usuario asociado al nuevo token
            $user = JWTAuth::setToken($newToken)->toUser();

            // Crear una nueva cookie con el token actualizado
            $cookie = cookie('token', $newToken, 60 * 24, '/', null, true, true); // Cookie HttpOnly, segura

            return response()->json([
                'message' => 'Token refrescado con éxito',
                'user' => $user,
            ])->cookie($cookie); // Devuelve la nueva cookie al cliente

        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json([
                'message' => 'Token expirado, por favor inicia sesión nuevamente'
            ], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json([
                'message' => 'Error al refrescar el token',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    
}
