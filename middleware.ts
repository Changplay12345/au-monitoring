import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/api']

// Routes that should redirect to login if not authenticated
const protectedRoutes = [
  '/',
  '/home',
  '/course-monitoring',
  '/dashboard',
  '/admin-panel',
  '/apis-services',
  '/documentation',
  '/project-overview',
  '/registration-simulator',
  '/simple',
  '/test',
  '/test-restaurant',
  '/tqf-desktop',
  '/tqf-master',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check for auth session cookie/token
  // We use a custom cookie since we're using localStorage-based auth
  // The cookie is set client-side after successful login
  const authToken = request.cookies.get('au_auth_token')?.value

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(`${route}/`))
  )

  // If accessing protected route without auth, redirect to login
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated user tries to access login, redirect to home
  if (pathname === '/login' && authToken) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files with extensions
     * - API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)|api).*)',
  ],
}
