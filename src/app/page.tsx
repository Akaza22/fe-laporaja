import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple Header */}
      <header className="p-6 flex justify-between items-center border-b">
        <h2 className="text-xl font-bold text-slate-900">LaporAja</h2>
        <Link 
          href="/login" 
          className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition"
        >
          Masuk
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
          Suara Anda, <span className="text-blue-600">Perubahan</span> Nyata.
        </h1>
        <p className="text-slate-600 text-lg mb-8 max-w-2xl">
          Platform digital untuk melaporkan berbagai masalah publik di sekitar Anda.
          Pantau status laporan secara real-time.
        </p>
        <div className="flex gap-4">
          <Link 
            href="/register" 
            className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition"
          >
            Mulai Lapor Sekarang
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-slate-400 text-sm border-t">
        © 2026 LaporAja Team. All rights reserved.
      </footer>
    </div>
  );
}