const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-500 to-red-500 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md animate-fade-in">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Bienvenido 👋
        </h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-600">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Ingresa tu correo"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-600">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-md transition-transform transform hover:scale-105"
          >
            Iniciar Sesión
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <a
            href="#"
            className="text-purple-600 hover:underline"
          >
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
