import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const url = request.nextUrl.pathname;

  // 1. Kalau belum login, tendang ke login (kecuali halaman auth)
  if (!token && (url.startsWith('/dashboard') || url.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. (Opsional tapi Bagus) Cek Role di Middleware
  // Catatan: Biasanya kita butuh decode JWT disini untuk tau role tanpa hit DB.
  // Untuk tahap awal, kita percayakan proteksi visual di halaman masing-masing dulu.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};