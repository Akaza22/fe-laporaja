import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ambil token dari cookies
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // 1. Kalau belum login sama sekali, tendang ke /login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // 2. Decode Token (Ambil Payload JWT)
    // Asumsinya kamu menggunakan JWT standar untuk token login
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const payload = JSON.parse(decodedJson);
    
    // Asumsi di dalam token kamu menyimpan data 'role' (contoh: 'ADMIN' atau 'USER')
    const role = payload.role?.toUpperCase(); 

    // 3. Aturan Proteksi Route
    // (Sesuaikan dengan path kamu)
    const isUserRoute = path.startsWith('/user') || path === '/reports/create';
    const isAdminRoute = path === '/dashboard' || path === '/reports' || path.startsWith('/users') || (path.startsWith('/chat') && !path.startsWith('/user/chat'));

    // Jika Warga (USER) iseng mengetik URL Admin
    if (isAdminRoute && role === 'USER') {
      return NextResponse.redirect(new URL('/user', request.url));
    }

    // Jika Admin iseng mengetik URL Warga
    if (isUserRoute && role === 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (error) {
    // Jika token rusak / expired, minta login ulang
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika aman, biarkan lewat
  return NextResponse.next();
}

// 4. Daftarkan URL mana saja yang mau diawasi oleh Middleware ini
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reports/:path*',
    '/users/:path*',
    '/chat/:path*',
    '/user/:path*',
  ]
}