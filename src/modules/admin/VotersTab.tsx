import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Contest, Voter } from "../../types/domain";

export function VotersTab() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState("");
  const [voters, setVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clearingId, setClearingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : "https://seu-dominio.com"),
    []
  );

  const loadContests = async () => {
    const { data } = await supabase.from("contests").select("*").order("created_at", {
      ascending: false,
    });
    setContests(data ?? []);
    if ((data?.length ?? 0) > 0 && !selectedContestId) {
      setSelectedContestId(data![0].id);
    }
  };

  const loadVoters = async (contestId: string) => {
    if (!contestId) {
      setVoters([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data, error: loadError } = await supabase
      .from("voters")
      .select("*")
      .eq("contest_id", contestId)
      .order("created_at", { ascending: false });
    if (loadError) {
      setError("Erro ao carregar tokens.");
      setIsLoading(false);
      return;
    }
    setVoters(data ?? []);
    setIsLoading(false);
  };

  const copyLink = async (voter: Voter) => {
    const link = `${baseUrl}/?token=${voter.code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(voter.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error("Erro ao copiar link", err);
      setError("Nao foi possivel copiar o link. Copie manualmente.");
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  useEffect(() => {
    if (selectedContestId) {
      loadVoters(selectedContestId);
    }
  }, [selectedContestId]);

  const generateCode = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2, 10);
  };

  const handleCreate = async () => {
    if (!selectedContestId) return;
    const code = generateCode();
    const payload = {
      contest_id: selectedContestId,
      code,
      is_active: true,
    };
    const { error: insertError } = await supabase.from("voters").insert(payload);
    if (insertError) {
      setError("Erro ao criar token.");
      return;
    }
    await loadVoters(selectedContestId);
  };

  const toggleActive = async (voter: Voter) => {
    const { error: updateError } = await supabase
      .from("voters")
      .update({ is_active: !voter.is_active })
      .eq("id", voter.id);
    if (updateError) {
      setError("Erro ao atualizar token.");
      return;
    }
    await loadVoters(selectedContestId);
  };

  const handleClearVotes = async (voter: Voter) => {
    const confirmed = window.confirm("Limpar todos os votos deste token? Esta acao nao pode ser desfeita.");
    if (!confirmed) return;

    setClearingId(voter.id);
    setError(null);

    const { error: deleteError } = await supabase.from("votes").delete().eq("voter_id", voter.id);
    if (deleteError) {
      setError("Erro ao limpar votos do token.");
      setClearingId(null);
      return;
    }

    await loadVoters(selectedContestId);
    setClearingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-200">Contest</label>
          <select
            value={selectedContestId}
            onChange={(e) => setSelectedContestId(e.target.value)}
            className="select-with-caret w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
          >
            {contests.map((contest) => (
              <option key={contest.id} value={contest.id}>
                {contest.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end justify-start">
          <button
            onClick={handleCreate}
            className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400"
          >
            Gerar novo token
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Tokens</h3>
          {isLoading && <span className="text-sm text-slate-300">Carregando...</span>}
        </div>
        {voters.length === 0 ? (
          <p className="text-sm text-slate-300">Nenhum token encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-auto border-collapse text-left">
              <thead>
                <tr className="bg-white/5 text-xs uppercase tracking-wide text-slate-200">
              <th className="px-3 py-2">Token</th>
              <th className="px-3 py-2">Link</th>
              <th className="px-3 py-2">Ativo</th>
              <th className="px-3 py-2">Acoes</th>
            </tr>
              </thead>
              <tbody>
                {voters.map((voter) => (
                  <tr key={voter.id} className="border-b border-white/5 text-sm text-slate-100">
                    <td className="px-3 py-2 font-mono">{voter.code}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <div className="max-w-[260px] truncate font-mono text-xs text-cyan-200">
                          {baseUrl}/?token={voter.code}
                        </div>
                        <button
                          onClick={() => copyLink(voter)}
                          className="w-fit rounded border border-white/25 px-2 py-1 text-[11px] font-semibold text-slate-100 hover:bg-white/10"
                        >
                          {copiedId === voter.id ? "Copiado!" : "Copiar link"}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">{voter.is_active ? "Sim" : "Nao"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleActive(voter)}
                          className="rounded-lg border border-cyan-400/60 px-3 py-1 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/10"
                        >
                          {voter.is_active ? "Desativar" : "Ativar"}
                        </button>
                        <button
                          onClick={() => handleClearVotes(voter)}
                          disabled={clearingId === voter.id}
                          className="rounded-lg border border-orange-400/60 px-3 py-1 text-xs font-semibold text-orange-100 hover:bg-orange-500/10 disabled:opacity-60"
                        >
                          {clearingId === voter.id ? "Limpando..." : "Limpar votos"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
