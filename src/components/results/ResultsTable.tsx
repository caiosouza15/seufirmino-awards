import type { ResultsCategory } from "../../hooks/useResultsData";

export type ResultsTableProps = {
  categories: ResultsCategory[];
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function ResultsTable({ categories }: ResultsTableProps) {
  return (
    <section className="rounded-3xl border border-violet-500/40 bg-white/5 p-6 md:p-10 shadow-[0_0_28px_rgba(139,92,246,0.35)] backdrop-blur-md space-y-5 md:space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Resumo</p>
          <h3 className="text-2xl font-bold text-white">Painel de resultados</h3>
          <p className="text-sm text-slate-200/80">
            Vencedores e percentuais por categoria
          </p>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] table-auto border-collapse text-left">
          <thead>
            <tr className="bg-gradient-to-r from-violet-700/40 to-cyan-600/30 text-xs uppercase tracking-wide text-cyan-50">
              <th className="px-4 py-3 font-semibold">Categoria</th>
              <th className="px-4 py-3 font-semibold">Vencedor</th>
              <th className="px-4 py-3 font-semibold">Votos</th>
              <th className="px-4 py-3 font-semibold">Percentual</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const winner =
                category.nominees.find((nominee) => nominee.isWinner) ??
                category.nominees[0] ??
                null;

              return (
                <tr
                  key={category.id}
                  className="border-b border-white/10 bg-slate-900/40 transition hover:bg-slate-800/50"
                >
                  <td className="px-4 py-4 text-sm font-semibold text-white">
                    {category.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-cyan-50">
                    {winner?.name ?? "Sem votos"}
                  </td>
                  <td className="px-4 py-4 text-sm text-cyan-100">
                    {winner ? winner.totalVotes : 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-fuchsia-100">
                    {winner ? formatPercent(winner.percent) : "0.0%"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
