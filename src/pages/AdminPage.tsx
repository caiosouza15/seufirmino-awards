import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { ErrorNotice } from "../components/admin/ErrorNotice";
import { AdminLogin } from "../modules/admin/AdminLogin";
import { CategoriesNomineesTab } from "../modules/admin/CategoriesNomineesTab";
import { ContestsTab } from "../modules/admin/ContestsTab";
import { ResultsTab } from "../modules/admin/ResultsTab";
import { VotersTab } from "../modules/admin/VotersTab";

type AdminStatus = "loading" | "login" | "notAdmin" | "ready" | "error";

export function AdminPage() {
  const [status, setStatus] = useState<AdminStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"contests" | "categories" | "voters" | "results">(
    "contests"
  );

  const userEmail = useMemo(() => user?.email ?? "", [user]);

  const loadSession = async () => {
    setStatus("loading");
    setErrorMessage(null);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("[AdminPage] getUser failed", userError);
      // Supabase returns AuthSessionMissingError when o usuario nao esta logado; trate como "login" em vez de erro.
      if (userError.name === "AuthSessionMissingError") {
        setStatus("login");
        return;
      }
      setErrorMessage(userError.message ?? String(userError));
      setStatus("error");
      return;
    }

    if (!userData.user) {
      setUser(null);
      setStatus("login");
      return;
    }

    setUser(userData.user);

    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminError) {
      console.error("[AdminPage] admin_profiles lookup failed", adminError);
      setErrorMessage(adminError.message ?? String(adminError));
      setStatus("error");
      return;
    }

    if (!adminProfile) {
      setStatus("notAdmin");
      return;
    }

    setStatus("ready");
  };

  useEffect(() => {
    loadSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setErrorMessage(null);
    setStatus("login");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <header className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
              Painel Quarteto Awards
            </p>
            <h1 className="text-2xl font-bold text-white">Admin</h1>
          </div>
          {userEmail && (
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1">
                {userEmail}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-red-500/50 px-3 py-1 text-red-200 hover:bg-red-500/10"
              >
                Sair
              </button>
            </div>
          )}
        </header>

        {status === "loading" && (
          <div className="flex items-center gap-3 text-slate-100">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <span>Carregando...</span>
          </div>
        )}

        {status === "error" && (
          <ErrorNotice
            title="Ocorreu um erro ao carregar o painel"
            description="Verifique as credenciais Supabase, a rede ou veja o console do navegador para detalhes."
            details={errorMessage}
            actionLabel="Tentar novamente"
            onAction={loadSession}
          />
        )}

        {status === "login" && <AdminLogin onLoginSuccess={loadSession} />}

        {status === "notAdmin" && (
          <div className="space-y-4 rounded-xl border border-yellow-500/40 bg-yellow-900/20 p-5 text-yellow-100">
            <p>Voce nao tem permissao para acessar este painel.</p>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-500/50 px-3 py-1 text-red-200 hover:bg-red-500/10"
            >
              Sair
            </button>
          </div>
        )}

        {status === "ready" && (
          <div className="space-y-6">
            <nav className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
              {[
                { key: "contests", label: "Concursos" },
                { key: "categories", label: "Categorias e Indicados" },
                { key: "voters", label: "Votantes" },
                { key: "results", label: "Resultados" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={[
                    "rounded-lg px-3 py-2 text-sm font-semibold transition",
                    activeTab === tab.key
                      ? "bg-cyan-500 text-slate-900 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                      : "text-slate-200 hover:bg-white/10",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg">
              {activeTab === "contests" && <ContestsTab />}
              {activeTab === "categories" && <CategoriesNomineesTab />}
              {activeTab === "voters" && <VotersTab />}
              {activeTab === "results" && <ResultsTab />}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
