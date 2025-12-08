import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Category, Contest, Nominee } from "../../types/domain";

const NOMINEE_IMAGES_BUCKET = "nominee-images";
const ALLOW_RESET = import.meta.env.VITE_ALLOW_ADMIN_RESET === "true";

type CategoryForm = {
  id?: string;
  name: string;
  description: string;
  sort_order: number;
};

type NomineeForm = {
  id?: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  sort_order: number;
};

const emptyCategory: CategoryForm = { name: "", description: "", sort_order: 0 };
const emptyNominee: NomineeForm = {
  category_id: "",
  name: "",
  description: "",
  image_url: "",
  sort_order: 0,
};

export function CategoriesNomineesTab() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState("");
  const [resetContestId, setResetContestId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);

  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategory);
  const [nomineeForm, setNomineeForm] = useState<NomineeForm>(emptyNominee);
  const [nomineeImageFile, setNomineeImageFile] = useState<File | null>(null);
  const nomineeFileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingNominee, setIsSavingNominee] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeletingContest, setIsDeletingContest] = useState(false);
  const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedContestName = useMemo(
    () => contests.find((c) => c.id === selectedContestId)?.name ?? "",
    [contests, selectedContestId]
  );
  const resetContestName = useMemo(
    () => contests.find((c) => c.id === resetContestId)?.name ?? "",
    [contests, resetContestId]
  );

  const loadContests = async () => {
    const { data } = await supabase.from("contests").select("*").order("created_at", {
      ascending: false,
    });
    setContests(data ?? []);
    if ((data?.length ?? 0) > 0 && !selectedContestId) {
      setSelectedContestId(data![0].id);
    }
    if ((data?.length ?? 0) > 0 && !resetContestId) {
      setResetContestId(data![0].id);
    }
  };

  const loadCategoriesAndNominees = async (contestId: string) => {
    if (!contestId) {
      setCategories([]);
      setNominees([]);
      return;
    }

    const { data: categoriesData, error: catError } = await supabase
      .from("categories")
      .select("*")
      .eq("contest_id", contestId)
      .order("sort_order", { ascending: true });

    if (catError) {
      setError("Erro ao carregar categorias.");
      return;
    }

    setCategories(categoriesData ?? []);

    const categoryIds = categoriesData?.map((c) => c.id) ?? [];
    if (categoryIds.length === 0) {
      setNominees([]);
      return;
    }

    const { data: nomineesData, error: nomError } = await supabase
      .from("nominees")
      .select("*")
      .in("category_id", categoryIds)
      .order("sort_order", { ascending: true });

    if (nomError) {
      setError("Erro ao carregar indicados.");
      return;
    }

    setNominees(nomineesData ?? []);
  };

  useEffect(() => {
    loadContests();
  }, []);

  useEffect(() => {
    if (selectedContestId) {
      loadCategoriesAndNominees(selectedContestId);
    }
  }, [selectedContestId]);

  const resetCategoryForm = () => setCategoryForm(emptyCategory);
  const resetNomineeForm = () => {
    setNomineeForm((prev) => ({ ...emptyNominee, category_id: selectedContestId }));
    setNomineeImageFile(null);
  };

  const openNomineeModal = (categoryId: string, nominee?: Nominee) => {
    if (nominee) {
      setNomineeForm({
        id: nominee.id,
        category_id: nominee.category_id,
        name: nominee.name,
        description: nominee.description ?? "",
        image_url: nominee.image_url ?? "",
        sort_order: nominee.sort_order,
      });
    } else {
      setNomineeForm({ ...emptyNominee, category_id: categoryId });
    }
    setNomineeImageFile(null);
    setIsNomineeModalOpen(true);
    setError(null);
  };

  const closeNomineeModal = () => {
    setIsNomineeModalOpen(false);
    resetNomineeForm();
  };

  const handleSaveCategory = async () => {
    if (!selectedContestId) {
      setError("Selecione um concurso.");
      return;
    }
    setIsSavingCategory(true);
    setError(null);

    const payload = {
      contest_id: selectedContestId,
      name: categoryForm.name,
      description: categoryForm.description || null,
      sort_order: categoryForm.sort_order,
    };

    if (categoryForm.id) {
      const { error: updateError } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", categoryForm.id);
      if (updateError) {
        setError("Erro ao atualizar categoria.");
        setIsSavingCategory(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("categories").insert(payload);
      if (insertError) {
        setError("Erro ao criar categoria.");
        setIsSavingCategory(false);
        return;
      }
    }

    await loadCategoriesAndNominees(selectedContestId);
    resetCategoryForm();
    setIsSavingCategory(false);
  };

  const handleEditCategory = (cat: Category) => {
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      description: cat.description ?? "",
      sort_order: cat.sort_order,
    });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await supabase.from("categories").delete().eq("id", categoryId);
    await loadCategoriesAndNominees(selectedContestId);
  };

  const handleResetContest = async (options?: { skipConfirm?: boolean }) => {
    const skipConfirm = options?.skipConfirm ?? false;
    if (!ALLOW_RESET) {
      setError("Reset desabilitado. Defina VITE_ALLOW_ADMIN_RESET=true para habilitar.");
      return false;
    }
    if (!resetContestId) {
      setError("Selecione um concurso.");
      return false;
    }
    if (!skipConfirm) {
      const confirmed = window.confirm(
        `Resetar dados (votos, indicados e categorias) do concurso "${resetContestName}"?`
      );
      if (!confirmed) return false;
    }

    setIsResetting(true);
    setError(null);

    const { data: categoryRows, error: loadCatsError } = await supabase
      .from("categories")
      .select("id")
      .eq("contest_id", resetContestId);
    if (loadCatsError) {
      setError("Erro ao carregar categorias para reset.");
      setIsResetting(false);
      return false;
    }

    const categoryIds = (categoryRows ?? []).map((c) => c.id);

    const { error: votesError } = await supabase.from("votes").delete().eq("contest_id", resetContestId);
    if (votesError) {
      setError("Erro ao limpar votos.");
      setIsResetting(false);
      return false;
    }

    await supabase.from("voters").delete().eq("contest_id", resetContestId);

    if (categoryIds.length > 0) {
      const { error: nomineesError } = await supabase
        .from("nominees")
        .delete()
        .in("category_id", categoryIds);
      if (nomineesError) {
        setError("Erro ao limpar indicados.");
        setIsResetting(false);
        return false;
      }
    }

    const { error: categoriesError } = await supabase
      .from("categories")
      .delete()
      .eq("contest_id", resetContestId);
    if (categoriesError) {
      setError("Erro ao limpar categorias.");
      setIsResetting(false);
      return false;
    }

    if (resetContestId === selectedContestId) {
      await loadCategoriesAndNominees(resetContestId);
    }
    setIsResetting(false);
    return true;
  };

  const handleDeleteContest = async () => {
    if (!ALLOW_RESET) {
      setError("Exclusao desabilitada. Defina VITE_ALLOW_ADMIN_RESET=true para habilitar.");
      return;
    }
    if (!resetContestId) {
      setError("Selecione um concurso.");
      return;
    }
    if (!window.confirm("Tem certeza que deseja excluir este concurso e todos os dados relacionados?")) {
      return;
    }

    setIsDeletingContest(true);
    setError(null);

    const resetOk = await handleResetContest({ skipConfirm: true });
    if (!resetOk) {
      setIsDeletingContest(false);
      return;
    }

    const { error: deleteContestError } = await supabase
      .from("contests")
      .delete()
      .eq("id", resetContestId);
    if (deleteContestError) {
      setError("Erro ao excluir concurso.");
      setIsDeletingContest(false);
      return;
    }

    const { data: remainingContests } = await supabase
      .from("contests")
      .select("*")
      .order("created_at", { ascending: false });
    setContests(remainingContests ?? []);

    const fallbackId = remainingContests?.[0]?.id ?? "";
    setResetContestId(fallbackId);
    if (resetContestId === selectedContestId) {
      setSelectedContestId(fallbackId);
      if (fallbackId) {
        await loadCategoriesAndNominees(fallbackId);
      } else {
        setCategories([]);
        setNominees([]);
      }
    }
    setIsDeletingContest(false);
  };

  const handleSaveNominee = async () => {
    if (!nomineeForm.category_id) {
      setError("Selecione uma categoria para o indicado.");
      return;
    }
    const nomineesInCategory = nominees.filter((n) => n.category_id === nomineeForm.category_id);
    if (!nomineeForm.id && nomineesInCategory.length >= 6) {
      setError("Limite de 6 indicados por categoria atingido.");
      return;
    }
    if (!nomineeForm.name.trim()) {
      setError("Nome do indicado é obrigatório.");
      return;
    }
    if (Number.isNaN(nomineeForm.sort_order)) {
      setError("Ordem de exibição deve ser um número.");
      return;
    }
    setIsSavingNominee(true);
    setError(null);

    let imageUrlToSave = nomineeForm.image_url || null;

    if (nomineeImageFile) {
      const fileExt = nomineeImageFile.name.split(".").pop() ?? "jpg";
      const fileName = `${crypto.randomUUID?.() ?? Date.now()}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from(NOMINEE_IMAGES_BUCKET)
        .upload(fileName, nomineeImageFile, { upsert: false });

      if (uploadError) {
        setError("Erro ao subir imagem do indicado.");
        setIsSavingNominee(false);
        return;
      }

      const { data: publicData } = supabase.storage
        .from(NOMINEE_IMAGES_BUCKET)
        .getPublicUrl(fileName);
      imageUrlToSave = publicData?.publicUrl ?? imageUrlToSave;
    }

    const payload = {
      category_id: nomineeForm.category_id,
      name: nomineeForm.name,
      description: nomineeForm.description || null,
      image_url: imageUrlToSave,
      sort_order: nomineeForm.sort_order,
    };

    if (nomineeForm.id) {
      const { error: updateError } = await supabase
        .from("nominees")
        .update(payload)
        .eq("id", nomineeForm.id);
      if (updateError) {
        setError("Erro ao atualizar indicado.");
        setIsSavingNominee(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("nominees").insert(payload);
      if (insertError) {
        setError("Erro ao criar indicado.");
        setIsSavingNominee(false);
        return;
      }
    }

    await loadCategoriesAndNominees(selectedContestId);
    resetNomineeForm();
    setIsSavingNominee(false);
    setIsNomineeModalOpen(false);
  };

  const handleDeleteNominee = async (nomineeId: string) => {
    await supabase.from("nominees").delete().eq("id", nomineeId);
    await loadCategoriesAndNominees(selectedContestId);
  };

  const renderNomineeModal = () => {
    if (!isNomineeModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {nomineeForm.id ? "Editar indicado" : "Novo indicado"}
              </h3>
              <p className="text-sm text-slate-300">Categoria selecionada automaticamente.</p>
            </div>
            <button
              onClick={closeNomineeModal}
              className="rounded-lg border border-white/10 px-3 py-1 text-sm text-slate-200 hover:bg-white/10"
            >
              Fechar
            </button>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-sm text-slate-200">Nome</label>
              <input
                value={nomineeForm.name}
                onChange={(e) => setNomineeForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-200">Descricao (opcional)</label>
              <input
                value={nomineeForm.description}
                onChange={(e) => setNomineeForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-200">Image URL</label>
              <input
                value={nomineeForm.image_url}
                onChange={(e) => setNomineeForm((prev) => ({ ...prev, image_url: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-200">Ou selecione um arquivo</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => nomineeFileInputRef.current?.click()}
                  className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                >
                  Escolher imagem
                </button>
                <span className="text-xs text-slate-300">
                  {nomineeImageFile ? `Selecionado: ${nomineeImageFile.name}` : "Nenhum arquivo selecionado"}
                </span>
              </div>
              <input
                ref={nomineeFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setNomineeImageFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              {nomineeForm.image_url && !nomineeImageFile && (
                <p className="text-xs text-slate-300">Usando URL atual: {nomineeForm.image_url}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-200">Ordem de exibicao (menor primeiro)</label>
              <input
                type="number"
                value={nomineeForm.sort_order}
                onChange={(e) => setNomineeForm((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleSaveNominee}
              disabled={isSavingNominee}
              className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-60"
            >
              {isSavingNominee ? "Salvando..." : nomineeForm.id ? "Atualizar" : "Criar"}
            </button>
            <button
              onClick={closeNomineeModal}
              className="rounded-lg border border-white/15 px-4 py-2 text-slate-200 hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-200">Concurso</label>
          <select
            value={selectedContestId}
            onChange={(e) => {
              setSelectedContestId(e.target.value);
              resetCategoryForm();
              resetNomineeForm();
            }}
            className="select-with-caret w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
          >
            {contests.map((contest) => (
              <option key={contest.id} value={contest.id}>
                {contest.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Reset/Exclusao de concurso</h3>
            <p className="text-sm text-slate-300">
              Selecione um concurso para limpar dados (votos/indicados/categorias) ou excluir tudo.
            </p>
          </div>
          {!ALLOW_RESET && (
            <span className="rounded-full border border-yellow-500/40 bg-yellow-900/30 px-3 py-1 text-xs font-semibold text-yellow-100">
              Desabilitado
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200">Concurso para reset/excluir</label>
          <select
            value={resetContestId}
            onChange={(e) => setResetContestId(e.target.value)}
            className="select-with-caret w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
            disabled={!ALLOW_RESET}
          >
            {contests.map((contest) => (
              <option key={contest.id} value={contest.id}>
                {contest.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleResetContest()}
            disabled={!ALLOW_RESET || !resetContestId || isResetting || isDeletingContest}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResetting ? "Limpando..." : "Resetar dados (mantem concurso)"}
          </button>
          <button
            onClick={handleDeleteContest}
            disabled={!ALLOW_RESET || !resetContestId || isResetting || isDeletingContest}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeletingContest ? "Excluindo..." : "Excluir concurso (tudo)"}
          </button>
        </div>
        <p className="text-xs text-slate-300">
          Use somente em ambientes de teste. Habilite com VITE_ALLOW_ADMIN_RESET=true.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {categoryForm.id ? "Editar categoria" : "Nova categoria"}
          </h3>
          <p className="text-sm text-slate-300">Gerencie categorias do concurso.</p>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Nome</label>
            <input
              value={categoryForm.name}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Descricao (opcional)</label>
            <input
              value={categoryForm.description}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Ordem de exibicao (menor primeiro)</label>
            <input
              type="number"
              value={categoryForm.sort_order}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSaveCategory}
            disabled={isSavingCategory}
            className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-60"
          >
            {isSavingCategory ? "Salvando..." : categoryForm.id ? "Atualizar" : "Criar"}
          </button>
          <button
            onClick={resetCategoryForm}
            className="rounded-lg border border-white/15 px-4 py-2 text-slate-200 hover:bg-white/10"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-lg font-semibold text-white">Categorias e indicados</h3>
        {categories.length === 0 && (
          <p className="text-sm text-slate-300">Nenhuma categoria cadastrada.</p>
        )}
        <div className="space-y-4">
          {categories.map((cat) => {
            const nomineesInCat = nominees.filter((n) => n.category_id === cat.id);
            return (
              <div key={cat.id} className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-white">{cat.name}</p>
                    <p className="text-xs text-slate-300">
                      {cat.description ?? "Sem descricao"} - Ordem {cat.sort_order}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openNomineeModal(cat.id)}
                      className="rounded-lg bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-cyan-400"
                      disabled={nomineesInCat.length >= 6}
                    >
                      Adicionar indicado
                    </button>
                    <button
                      onClick={() => handleEditCategory(cat)}
                      className="rounded-lg border border-cyan-400/60 px-3 py-1 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/10"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="rounded-lg border border-red-500/60 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-500/10"
                    >
                      Remover
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {nomineesInCat.map((nominee) => (
                    <div
                      key={nominee.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center gap-3">
                        {nominee.image_url ? (
                          <img
                            src={nominee.image_url}
                            alt={nominee.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-slate-200">
                            {nominee.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{nominee.name}</p>
                          <p className="text-xs text-slate-300">
                            {nominee.description ?? "Sem descricao"} - Ordem {nominee.sort_order}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openNomineeModal(cat.id, nominee)}
                          className="rounded-lg border border-cyan-400/60 px-3 py-1 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/10"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteNominee(nominee.id)}
                          className="rounded-lg border border-red-500/60 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-500/10"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {renderNomineeModal()}
    </div>
  );
}
