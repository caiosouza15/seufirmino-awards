import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export type AdminLoginProps = {
  onLoginSuccess: () => void;
};

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Login invalido");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onLoginSuccess();
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white">Entrar</h2>
      <p className="text-sm text-slate-300">Acesso restrito a administradores</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-slate-200" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-200" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
            required
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:opacity-60"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
