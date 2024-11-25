const LoginPage = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg flex flex-col md:flex-row w-full max-w-4xl animate-fade-in">
        {/* Sección de la imagen */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="https://windmill-dashboard-nextjs-typescript.vercel.app/_next/image?url=%2Fassets%2Fimg%2Flogin-office.jpeg&w=1920&q=75"
            alt="Imagen de bienvenida"
            className="object-cover w-full h-full rounded-l-lg"
          />
        </div>
        {/* Sección del formulario */}
        <div className="w-full md:w-1/2 p-8">
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
          <div className="space-y-3 mt-10">
            <button
              type="submit"
              className="w-full py-2 border border-gray-400 text-gray-400 font-bold rounded-md transition-transform transform hover:scale-105"
            >
              Git hub
            </button>
            <button
              type="submit"
              className="w-full py-2 border border-gray-400 text-gray-400 font-bold rounded-md transition-transform transform hover:scale-105"
            >
              Gmail
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <a href="#" className="text-purple-600 hover:underline">
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
