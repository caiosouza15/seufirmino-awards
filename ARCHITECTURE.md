# ARCHITECTURE.md – Quarteto Awards

Este documento define a **arquitetura obrigatória** do frontend do projeto Quarteto Awards.  
Qualquer IA ou desenvolvedor deve seguir **exatamente** esta estrutura, evitando criar novas pastas, padrões ou rotas que não estejam aqui ou no `SPEC.md`.

> Leia este arquivo **junto com** o `SPEC.md`. O `SPEC.md` define _o que_ o sistema faz.  
> O `ARCHITECTURE.md` define _como o frontend deve ser organizado_.

---

## 1. Stack de Frontend

- React + Vite + TypeScript
- React Router para rotas
- Supabase JS client em `src/lib/supabaseClient.ts`
- Estilização preferencial: **Tailwind CSS** (quando for usado utilitário).  
  - Também é permitido CSS Modules, mas **não misturar** estratégias no mesmo componente.

---

## 2. Estrutura de Pastas (Obrigatória)

Toda a estrutura de código deve ficar dentro de `src/` conforme abaixo:

```text
src/
  main.tsx
  App.tsx
  router.tsx

  lib/
    supabaseClient.ts

  types/
    domain.ts

  modules/
    public/
      vote/
        VotePage.tsx
        components/
          CategoryStep.tsx
          NomineeGrid.tsx
          NomineeCard.tsx
          VoteProgressBar.tsx

      results/
        ResultsPage.tsx
        components/
          ResultsCarousel.tsx
          ResultsSlide.tsx
          ResultsSummaryTable.tsx
          CountdownTeaser.tsx

    admin/
      AdminApp.tsx
      pages/
        AdminLoginPage.tsx
        AdminDashboardPage.tsx
      components/
        AdminShell.tsx
        ContestList.tsx
        ContestForm.tsx
        CategoryList.tsx
        CategoryForm.tsx
        NomineeList.tsx
        NomineeForm.tsx
        VoterList.tsx
        VoterForm.tsx
        AdminResultsTable.tsx

  components/
    layout/
      PageContainer.tsx
      NeonHeader.tsx
      NeonFooter.tsx

    neon/
      NeonButton.tsx
      NeonCard.tsx
      NeonBadge.tsx
      NeonToggle.tsx
      NeonAlert.tsx

  hooks/
    useContestData.ts
    useVoteFlow.ts
    useResultsData.ts
    useAuthGuard.ts

  styles/
    globals.css   (ou index.css, conforme Vite)
```

### Regras importantes

1. **Não criar novas pastas de topo** além das existentes acima (lib, types, modules, components, hooks, styles).
2. **Não criar rotas** fora de:
   - `/` – `VotePage`
   - `/results` – `ResultsPage`
   - `/admin` – `AdminApp`
3. Todo código relacionado à votação pública fica em `modules/public/vote`.
4. Todo código relacionado à tela de resultados públicos fica em `modules/public/results`.
5. Tudo de admin fica em `modules/admin`.

---

## 3. Arquivos de entrada e roteamento

### 3.1. `main.tsx`

Responsável por:

- Renderizar o `<App />` dentro de `#root`.
- Envolver o app com quaisquer providers globais (ex: BrowserRouter).

Exemplo de estrutura (simplificada):

```ts
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### 3.2. `App.tsx`

Responsável **apenas** por:

- Importar `router.tsx`
- Renderizar `<RouterProvider />` ou equivalentemente `<Routes>`/`<Route>`.

Exemplo:

```ts
import { AppRouter } from "./router";

export default function App() {
  return <AppRouter />;
}
```

### 3.3. `router.tsx`

Define as rotas:

- `/` → `VotePage`
- `/results` → `ResultsPage`
- `/admin` → `AdminApp`

Exemplo de definição:

```ts
import { Routes, Route } from "react-router-dom";
import { VotePage } from "./modules/public/vote/VotePage";
import { ResultsPage } from "./modules/public/results/ResultsPage";
import { AdminApp } from "./modules/admin/AdminApp";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<VotePage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}
```

---

## 4. Integração com Supabase

### 4.1. `lib/supabaseClient.ts`

Deve ser o **único lugar** onde o client do Supabase é inicializado.

```ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Regras:

- Não criar outro client em nenhum outro arquivo.
- Todos os módulos devem importar `supabase` daqui.

---

## 5. Hooks customizados obrigatórios

### 5.1. `useContestData.ts`

Responsável por:

- Receber o `token` (quando aplicável).
- Carregar:
  - voter
  - contest
  - categories
  - nominees
- Expor estados:
  - `isLoading`, `error`, `voter`, `contest`, `categories`, `nomineesByCategory`.

### 5.2. `useVoteFlow.ts`

Responsável por:

- Orquestrar o **carrossel mágico**:
  - índice da categoria atual
  - seleção do nominee
  - avanço de categoria
  - envio dos votos

### 5.3. `useResultsData.ts`

Responsável por:

- Na `/results`:
  - Carregar o contest ativo (ou por ID definido).
  - Verificar `reveal_at`.
  - Carregar dados agregados para:
    - Carrossel de vencedores.
    - Dashboard de resumo.

### 5.4. `useAuthGuard.ts`

Responsável por:

- Garantir que o usuário está logado e é admin.
- Usado em `AdminApp`.

---

## 6. Módulo de Votação (`modules/public/vote`)

### 6.1. `VotePage.tsx`

Responsável por:

- Ler o token da URL.
- Chamar `useContestData`.
- Verificar estados de erro:
  - token inválido
  - link inativo
  - votação fora de período
  - já votou
- Renderizar:
  - `<NeonHeader />`
  - uma `<NeonAlert />` com a mensagem adequada, se erro
  - `<CategoryStep />` dentro de um fluxo de carrossel se tudo ok.

---

## 7. Módulo de Resultados (`modules/public/results`)

### 7.1. `ResultsPage.tsx`

Responsável por:

- Verificar `reveal_at`.
- Se ainda não passou:
  - Renderizar `<CountdownTeaser />`.
- Se já passou:
  - Renderizar:
    - `<ResultsCarousel />`
    - `<ResultsSummaryTable />`

---

## 8. Módulo de Admin (`modules/admin`)

### 8.1. `AdminApp.tsx`

Responsável por:

- Encapsular rotas internas de admin (ex: `/admin`, `/admin/contests`, etc).
- Usar `useAuthGuard` para garantir acesso.

Estrutura sugerida de rotas internas (não mudar prefixo base `/admin`):

```text
/admin          -> AdminDashboardPage
/admin/contests -> tela de contests
/admin/categories -> tela de categories
/admin/voters   -> tela de tokens
/admin/results  -> tela de resultados
```

---

## 9. Componentes de Layout Globais

Os componentes dentro de `components/layout` e `components/neon` são reutilizáveis e devem ser usados sempre que possível, para evitar duplicação de estilo e comportamento.

- `PageContainer`
- `NeonHeader`
- `NeonFooter`
- `NeonButton`
- `NeonCard`
- `NeonBadge`
- `NeonToggle`
- `NeonAlert`

Implementações detalhadas e props obrigatórias destes componentes estarão em `COMPONENTS.md`.

---

## 10. Regras de Arquitetura

- Não criar lógica de negócios diretamente dentro de `Neon*` components (eles são **presentational**).
- Lógica de fluxo deve ficar em:
  - hooks (`useVoteFlow`, `useResultsData`, etc.),
  - páginas (`VotePage`, `ResultsPage`, `Admin*Page`).
- Não criar novas rotas sem atualizar `SPEC.md` e este `ARCHITECTURE.md`.
- Não deixar chamadas ao Supabase “espalhadas” — preferir centralizar por contexto em hooks.

---

_Fim do ARCHITECTURE.md_
