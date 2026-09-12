import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Bell, Globe, LogOut, Mail, Moon, Shield, Sun, User,
  UserRound, Zap, MapPin, Radio, Clock3,
} from "lucide-react";

function AlphaInnovXLogo({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/alpha-innovx-logo.png"
      alt="Alpha InnovX"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <AlphaInnovXLogo size={36} />
      {!compact && (
        <div>
          <div className="text-sm font-bold tracking-[.18em] text-white">ALPHA INNOVX</div>
          <div className="text-[8px] font-semibold tracking-[.16em] text-white/45">CONTROL ROOM</div>
        </div>
      )}
    </Link>
  );
}

type Preferences = {
  notifications: boolean;
  emailAlerts: boolean;
  theme: "light" | "dark" | "system";
  mapDefault: "2d" | "satellite";
  autoRefresh: boolean;
  refreshInterval: number;
  language: string;
  timezone: string;
  riskThreshold: "low" | "medium" | "high";
};

const defaultPreferences: Preferences = {
  notifications: true,
  emailAlerts: false,
  theme: "light",
  mapDefault: "2d",
  autoRefresh: true,
  refreshInterval: 120,
  language: "en",
  timezone: "Asia/Kolkata",
  riskThreshold: "medium",
};

export default function UserProfile() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fa] flex items-center justify-center">
        <div className="text-[#607285] text-sm">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0b1f33] flex items-center justify-center text-white">
        <div className="text-center space-y-4 max-w-sm px-6">
          <AlphaInnovXLogo size={56} />
          <div className="text-lg font-bold mt-4">Sign in required</div>
          <p className="text-sm text-white/55">Sign in with your Google account to view your profile and manage preferences.</p>
          <button
            onClick={() => startLogin()}
            className="mt-4 w-full rounded-xl bg-[#e6aa5d] px-5 py-3 text-sm font-bold text-[#0b1f33] transition hover:bg-[#f2bd77]"
          >
            Sign in with Google
          </button>
          <Link href="/" className="block text-xs text-white/40 hover:text-white/70 mt-2">← Back to home</Link>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : (user.email?.[0] ?? "U").toUpperCase();

  function updatePref<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function savePreferences() {
    // In a real app this would persist to the server
    toast.success("Preferences saved successfully.");
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-[#0b1f33]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b1f33] text-white">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Brand />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/control-room"
              className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:bg-white/10"
            >
              <ArrowLeft className="size-3.5" /> Control Room
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:bg-white/10"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
        {/* Profile card */}
        <div className="rounded-2xl border border-[#d8e1e8] bg-white shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#0b1f33] to-[#1a3a55] p-6 text-white">
            <div className="flex items-center gap-5">
              <div className="relative">
                {(user as any).picture ? (
                  <img
                    src={(user as any).picture}
                    alt={user.name ?? "User"}
                    className="size-20 rounded-full border-4 border-white/20 object-cover"
                  />
                ) : (
                  <div className="size-20 rounded-full border-4 border-white/20 bg-[#294760] grid place-items-center text-2xl font-bold">
                    {initials}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 size-4 rounded-full bg-[#57d39a] border-2 border-[#0b1f33]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name ?? "Operator"}</h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                  <Mail className="size-3.5" />
                  <span>{user.email ?? "—"}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6aa5d]/20 px-2.5 py-1 text-[10px] font-bold tracking-[.08em] text-[#f1c486]">
                    <Shield className="size-3" />
                    {(user.role ?? "user").toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#57d39a]/15 px-2.5 py-1 text-[10px] font-bold tracking-[.08em] text-[#8dd4b0]">
                    <span className="size-1.5 rounded-full bg-[#57d39a]" />
                    ACTIVE SESSION
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account details */}
          <div className="p-6 grid sm:grid-cols-2 gap-4">
            {[
              ["User ID", String((user as any).id ?? "—"), User],
              ["Email", user.email ?? "—", Mail],
              ["Role", (user.role ?? "user").charAt(0).toUpperCase() + (user.role ?? "user").slice(1), Shield],
              ["Auth provider", "Google OAuth 2.0", Globe],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="rounded-xl border border-[#e5ebef] bg-[#f7fafb] p-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.13em] text-[#8493a0] mb-1">
                  <Icon className="size-3.5" />
                  {String(label)}
                </div>
                <div className="text-sm font-semibold text-[#0b1f33]">{String(value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-[#d8e1e8] bg-white shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8493a0] mb-1">Settings</div>
              <h2 className="text-base font-bold">Preferences</h2>
            </div>
            {saved && (
              <span className="text-xs font-semibold text-[#1f9d68] bg-[#e1f5ec] px-3 py-1.5 rounded-full">Saved</span>
            )}
          </div>

          <div className="space-y-5">
            {/* Notifications */}
            <div className="border-b border-[#f0f4f7] pb-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#607285] mb-3">
                <Bell className="size-3.5" /> Notifications
              </div>
              <div className="space-y-3">
                {[
                  ["Push notifications", "notifications" as const],
                  ["Email alerts for RED warnings", "emailAlerts" as const],
                ].map(([label, key]) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-[#243447]">{label}</span>
                    <button
                      onClick={() => updatePref(key, !prefs[key])}
                      className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${prefs[key] ? "bg-[#0f766e]" : "bg-[#d1d9e0]"}`}
                    >
                      <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${prefs[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            {/* Appearance */}
            <div className="border-b border-[#f0f4f7] pb-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#607285] mb-3">
                <Sun className="size-3.5" /> Appearance
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => updatePref("theme", t)}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition ${prefs.theme === t ? "border-[#0f766e] bg-[#e2f0ed] text-[#0f766e]" : "border-[#d8e1e8] text-[#607285] hover:border-[#9bc9bf]"}`}
                  >
                    {t === "light" ? <Sun className="size-3.5" /> : t === "dark" ? <Moon className="size-3.5" /> : <Globe className="size-3.5" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="border-b border-[#f0f4f7] pb-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#607285] mb-3">
                <MapPin className="size-3.5" /> Map
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["2d", "satellite"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => updatePref("mapDefault", m)}
                    className={`rounded-lg border py-2.5 text-xs font-semibold transition ${prefs.mapDefault === m ? "border-[#0f766e] bg-[#e2f0ed] text-[#0f766e]" : "border-[#d8e1e8] text-[#607285] hover:border-[#9bc9bf]"}`}
                  >
                    {m === "2d" ? "2D Street Map" : "Satellite View"}
                  </button>
                ))}
              </div>
            </div>

            {/* Data & Refresh */}
            <div className="border-b border-[#f0f4f7] pb-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#607285] mb-3">
                <Radio className="size-3.5" /> Data & Refresh
              </div>
              <label className="flex items-center justify-between cursor-pointer mb-3">
                <span className="text-sm font-medium text-[#243447]">Auto-refresh weather</span>
                <button
                  onClick={() => updatePref("autoRefresh", !prefs.autoRefresh)}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${prefs.autoRefresh ? "bg-[#0f766e]" : "bg-[#d1d9e0]"}`}
                >
                  <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${prefs.autoRefresh ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </label>
              {prefs.autoRefresh && (
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#8493a0] mb-2">
                    <Clock3 className="size-3" /> Refresh interval
                  </div>
                  <div className="flex gap-2">
                    {[60, 120, 300, 600].map((s) => (
                      <button
                        key={s}
                        onClick={() => updatePref("refreshInterval", s)}
                        className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${prefs.refreshInterval === s ? "border-[#0f766e] bg-[#e2f0ed] text-[#0f766e]" : "border-[#d8e1e8] text-[#607285]"}`}
                      >
                        {s < 60 ? `${s}s` : s < 3600 ? `${s / 60}m` : `${s / 3600}h`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Risk threshold */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#607285] mb-3">
                <Zap className="size-3.5" /> Alert threshold
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => updatePref("riskThreshold", r)}
                    className={`rounded-lg border py-2.5 text-xs font-semibold transition ${prefs.riskThreshold === r ? "border-[#0f766e] bg-[#e2f0ed] text-[#0f766e]" : "border-[#d8e1e8] text-[#607285] hover:border-[#9bc9bf]"}`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)} risk
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-[#8493a0]">Controls which risk events trigger push notifications.</p>
            </div>
          </div>

          <button
            onClick={savePreferences}
            className="mt-6 w-full rounded-xl bg-[#0b1f33] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#173852]"
          >
            Save preferences
          </button>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-[#f5c6c2] bg-white shadow-sm p-6">
          <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#b42318] mb-3">Account</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[#0b1f33]">Sign out</div>
              <div className="text-xs text-[#607285] mt-0.5">You will need to re-authenticate with Google.</div>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 rounded-xl border border-[#f5c6c2] px-4 py-2.5 text-sm font-semibold text-[#b42318] transition hover:bg-[#fde9e7]"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
