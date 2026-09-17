import { AlertTriangle, ArrowLeft, Home, Map, Radio, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <main className="min-h-screen bg-[#f4f7fa] text-[#0b1f33]">
      <header className="border-b border-white/10 bg-[#0b1f33] text-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/flood-nexus-logo.png" alt="Flood Nexus" className="size-9 object-contain" />
            <span><b className="block text-sm tracking-[.18em]">FLOOD NEXUS</b><small className="block text-[8px] tracking-[.16em] text-white/45">EVACUATION INTELLIGENCE</small></span>
          </Link>
          <Link href="/control-room" className="hidden items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white/75 hover:bg-white/10 sm:flex"><Map className="size-3.5" /> Control Room</Link>
        </div>
      </header>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 px-5 py-12 lg:grid-cols-[.8fr_1.2fr]">
        <div className="relative hidden h-[360px] overflow-hidden rounded-[2rem] bg-[#0b1f33] p-6 shadow-panel lg:block">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, #0f766e 0, transparent 32%), radial-gradient(circle at 80% 70%, #2b6cb0 0, transparent 28%)" }} />
          <svg viewBox="0 0 420 300" className="relative size-full"><path d="M20 244 C 90 208, 100 92, 178 126 S 278 236, 400 45" fill="none" stroke="#9bc9bf" strokeWidth="3" opacity=".8" /><path d="M75 48 L 156 104 L 224 150 L 302 190 L 370 172" fill="none" stroke="#e6aa5d" strokeWidth="4" strokeDasharray="8 8" /><circle cx="302" cy="190" r="12" fill="#c53030" stroke="white" strokeWidth="3" /><circle cx="302" cy="190" r="28" fill="none" stroke="#c53030" opacity=".45" /></svg>
          <div className="absolute bottom-6 left-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/50"><Radio className="size-3.5 text-[#8dd4b0]" /> Operating picture unavailable</div>
        </div>
        <div className="max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#fff1e5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#c25f1c]"><AlertTriangle className="size-3.5" /> Route not found</div>
          <div className="display text-8xl leading-none text-[#0b1f33]">404</div>
          <h1 className="mt-4 text-3xl font-bold md:text-4xl">This operating view is unavailable.</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#607285]">The page may have moved or the link may be stale. Return to the live situation room or continue from the Flood Nexus home page.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => setLocation("/control-room")} className="flex items-center gap-2 rounded-xl bg-[#0b1f33] px-4 py-3 text-sm font-bold text-white hover:bg-[#173852]"><RefreshCw className="size-4" /> Open situation room</button>
            <Link href="/" className="flex items-center gap-2 rounded-xl border border-[#d8e1e8] bg-white px-4 py-3 text-sm font-bold hover:border-[#9bc9bf]"><Home className="size-4" /> Go home</Link>
          </div>
          <Link href="/" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#0f766e]"><ArrowLeft className="size-3.5" /> Return to Flood Nexus</Link>
        </div>
      </section>
    </main>
  );
}

void useLocation;
void AlertTriangle;
void ArrowLeft;
void Home;
void Map;
void Radio;
void RefreshCw;
void Link;
