import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Category, Contest, Nominee } from "../../types/domain";

type ResultRow = {
  category: string;
  nominee: string;
  votes: number;
  percent: number;
};

export function ResultsTab() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState("");
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContests = async () => {
    const { data } = await supabase.from("contests").select("*").order("created_at", {
      ascending: false,
    });
    setContests(data ?? []);
    if ((data?.length ?? 0) > 0 && !selectedContestId) {
      setSelectedContestId(data![0].id);
    }
  };

  const loadResults = async (contestId: string) => {
    if (!contestId) {
      setRows([]);
      return;
    }
    setIsLoading(true);
    setError(null);

    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .eq("contest_id", contestId)
      .order("sort_order", { ascending: true });

    if (catError) {
      setError("Erro ao carregar categorias.");
      setIsLoading(false);
      return;
    }

    const categoryIds = categories?.map((c) => c.id) ?? [];
    if (categoryIds.length === 0) {
      setRows([]);
      setIsLoading(false);
      return;
    }

    const { data: nominees, error: nomError } = await supabase
      .from("nominees")
      .select("*")
      .in("category_id", categoryIds);

    if (nomError) {
      setError("Erro ao carregar indicados.");
      setIsLoading(false);
      return;
    }

    const { data: votes, error: voteError } = await supabase
      .from("votes")
      .select("category_id, nominee_id")
      .eq("contest_id", contestId);

    if (voteError) {
      setError("Erro ao carregar votos.");
      setIsLoading(false);
      return;
    }

    const voteCounts: Record<string, Record<string, number>> = {};
    (votes ?? []).forEach((vote) => {
      if (!voteCounts[vote.category_id]) {
        voteCounts[vote.category_id] = {};
      }
      voteCounts[vote.category_id][vote.nominee_id] =
        (voteCounts[vote.category_id][vote.nominee_id] ?? 0) + 1;
    });

    const tableRows: ResultRow[] = [];

    (categories ?? []).forEach((category: Category) => {
      const nomineesForCategory = (nominees ?? []).filter(
        (n: Nominee) => n.category_id === category.id
      );
      const totalVotes = Object.values(voteCounts[category.id] ?? {}).reduce(
        (sum, v) => sum + v,
        0
      );

      nomineesForCategory
        .map((nominee) => {
          const votesForNominee = voteCounts[category.id]?.[nominee.id] ?? 0;
          const percent = totalVotes > 0 ? (votesForNominee / totalVotes) * 100 : 0;
          return {
            category: category.name,
            nominee: nominee.name,
            votes: votesForNominee,
            percent,
          };
        })
        .sort((a, b) => b.votes - a.votes)
        .forEach((row) => tableRows.push(row));
    });

    setRows(tableRows);
    setIsLoading(false);
  };

  useEffect(() => {
    loadContests();
  }, []);

  useEffect(() => {
    if (selectedContestId) {
      loadResults(selectedContestId);
    }
  }, [selectedContestId]);

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
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

      <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Resultados</h3>
          {isLoading && <span className="text-sm text-slate-300">Carregando...</span>}
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-300">Nenhum dado para exibir.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-auto border-collapse text-left">
              <thead>
                <tr className="bg-white/5 text-xs uppercase tracking-wide text-slate-200">
                  <th className="px-3 py-2">Categoria</th>
                  <th className="px-3 py-2">Nominee</th>
                  <th className="px-3 py-2">Votos</th>
                  <th className="px-3 py-2">Percentual</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={`${row.category}-${row.nominee}-${idx}`} className="border-b border-white/5 text-sm text-slate-100">
                    <td className="px-3 py-2 font-semibold">{row.category}</td>
                    <td className="px-3 py-2">{row.nominee}</td>
                    <td className="px-3 py-2">{row.votes}</td>
                    <td className="px-3 py-2">{row.percent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
