import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Contest } from "../../types/domain";

type ContestForm = {
  id?: string;
  name: string;
  description: string;
  start_at: string;
  end_at: string;
  reveal_at: string;
  is_active: boolean;
};

const emptyForm: ContestForm = {
  name: "",
  description: "",
  start_at: "",
  end_at: "",
  reveal_at: "",
  is_active: true,
};

export function ContestsTab() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [form, setForm] = useState<ContestForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContests = async () => {
    const { data, error: loadError } = await supabase
      .from("contests")
      .select("*")
      .order("created_at", { ascending: false });
    if (loadError) {
      setError("Nao foi possivel carregar contests.");
      return;
    }
    setContests(data ?? []);
  };

  useEffect(() => {
    loadContests();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      description: form.description || null,
      start_at: form.start_at || null,
      end_at: form.end_at || null,
      reveal_at: form.reveal_at || null,
      is_active: form.is_active,
    };

    if (form.id) {
      const { error: updateError } = await supabase
        .from("contests")
        .update(payload)
        .eq("id", form.id);
      if (updateError) {
        setError("Erro ao atualizar contest.");
        setIsSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("contests").insert(payload);
      if (insertError) {
        setError("Erro ao criar contest.");
        setIsSaving(false);
        return;
      }
    }

    await loadContests();
    resetForm();
    setIsSaving(false);
  };

  const handleEdit = (contest: Contest) => {
    setForm({
      id: contest.id,
      name: contest.name,
      description: contest.description ?? "",
      start_at: contest.start_at,
      end_at: contest.end_at,
      reveal_at: contest.reveal_at ?? "",
      is_active: contest.is_active,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {form.id ? "Editar concurso" : "Novo concurso"}
          </h3>
          <p className="text-sm text-slate-300">
            Cadastre concursos e datas de votacao/revelacao.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Nome do concurso</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Descricao (opcional)</label>
            <input
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Inicio da votacao</label>
            <input
              type="datetime-local"
              value={form.start_at}
              onChange={(e) => setForm((prev) => ({ ...prev, start_at: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Fim da votacao</label>
            <input
              type="datetime-local"
              value={form.end_at}
              onChange={(e) => setForm((prev) => ({ ...prev, end_at: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Revelacao</label>
            <input
              type="datetime-local"
              value={form.reveal_at}
              onChange={(e) => setForm((prev) => ({ ...prev, reveal_at: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 accent-cyan-400"
            />
            <label htmlFor="is_active" className="text-sm text-slate-200">
              Ativo (aparece na votacao)
            </label>
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-60"
          >
            {isSaving ? "Salvando..." : form.id ? "Atualizar" : "Criar"}
          </button>
          <button
            onClick={resetForm}
            className="rounded-lg border border-white/15 px-4 py-2 text-slate-200 hover:bg-white/10"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-lg font-semibold text-white">Lista de concursos</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] table-auto border-collapse text-left">
            <thead>
              <tr className="bg-white/5 text-xs uppercase tracking-wide text-slate-200">
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Periodo</th>
                <th className="px-3 py-2">Reveal</th>
                <th className="px-3 py-2">Ativo</th>
                <th className="px-3 py-2">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {contests.map((c) => (
                <tr key={c.id} className="border-b border-white/5 text-sm text-slate-100">
                  <td className="px-3 py-2 font-semibold">{c.name}</td>
                  <td className="px-3 py-2">
                    {c.start_at} - {c.end_at}
                  </td>
                  <td className="px-3 py-2">{c.reveal_at ?? "-"}</td>
                  <td className="px-3 py-2">{c.is_active ? "Sim" : "Nao"}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="rounded-lg border border-cyan-400/60 px-3 py-1 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/10"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
