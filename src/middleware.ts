import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // --- 1. DAFTAR HALAMAN YANG WAJIB LOGIN (Protected) ---
  // Kita cek apakah URL saat ini diawali dengan salah satu dari ini:
  const protectedPaths = ['/admin', '/user', '/dashboard', '/reports'];
  
  const isProtectedRoute = protectedPaths.some((path) => 
    pathname.startsWith(path)
  );

  // --- 2. DAFTAR HALAMAN AUTH (Login/Register) ---
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // === LOGIKA REDIRECT ===

  // A. Jika BELUM LOGIN tapi coba buka halaman Protected (/reports, /admin, dll)
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    // (Opsional) Simpan url tujuan biar nanti bisa redirect balik setelah login
    loginUrl.searchParams.set('callbackUrl', pathname); 
    return NextResponse.redirect(loginUrl);
  }

  // B. Jika SUDAH LOGIN tapi coba buka halaman Login/Register
  if (token && isAuthPage) {
    // Redirect ke dashboard (atau sesuaikan logic role jika ada)
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// === KONFIGURASI MATCHER (PENTING!) ===
// Middleware HANYA aktif di route yang terdaftar di sini.
export const config = {
  matcher: [
    '/admin/:path*',      // Semua route admin
    '/user/:path*',       // Semua route user
    '/dashboard/:path*',  // Dashboard
    '/reports/:path*',    // <--- TAMBAHAN PENTING: Laporan & Detail Laporan
    '/login',
    '/register',
  ],
};