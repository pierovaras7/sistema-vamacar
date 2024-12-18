import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Verifica si el usuario está autenticado (por ejemplo, si existe un token en las cookies)
  const isAuthenticated = request.cookies.get('token');

  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));

  }

  // Si el usuario está autenticado y está intentando acceder a /login, redirigirlo a /admin
  if (isAuthenticated && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url)); // Redirige a /admin
  }
  
  // Redirige a /login si no está autenticado y no está ya en la página de login
  if (!isAuthenticated && request.nextUrl.pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname); // Mantener la ruta original
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está autenticado y está intentando acceder a /login, redirigirlo a /admin
  if (isAuthenticated && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url)); // Redirige a /admin
  }



  return NextResponse.next();
}
 
export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico|images|css|js).*)', // Excluye rutas estáticas
  ],
};