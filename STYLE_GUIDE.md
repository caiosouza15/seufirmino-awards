# STYLE_GUIDE.md – Quarteto Awards

Este documento define as **regras de código** para o projeto.  
O objetivo é garantir que qualquer implementação (humana ou IA) produza código consistente, legível e fácil de manter.

---

## 1. Linguagem e Ferramentas

- Linguagem: **TypeScript**
- Framework: **React**
- Bundler: **Vite**
- Roteamento: **React Router**
- Estilo: preferencialmente **Tailwind CSS**. CSS Modules permitido em casos pontuais.

---

## 2. Padrões de Código

### 2.1. Componentes

- Usar **React Function Components** com arrow functions:

```ts
export const MeuComponente: React.FC<Props> = (props) => {
  return <div />;
};
```

- Não usar `React.FC` se preferir a forma simples, mas manter o padrão dentro do projeto (não misturar estilos):

```ts
type Props = { /* ... */ };

export function MeuComponente(props: Props) {
  return <div />;
}
```

- Um arquivo por componente.
- Nome do arquivo sempre em **PascalCase** (ex: `VotePage.tsx`, `NeonButton.tsx`).

---

### 2.2. Tipos e Interfaces

- Tipos de domínio devem ficar em `src/types/domain.ts`.
- Componentes devem importar tipos de domínio de `types/domain.ts`, **não** do Supabase diretamente.
- Preferir `type` para props:

```ts
export type VoteProgressBarProps = {
  current: number;
  total: number;
};
```

---

### 2.3. Nomes de Variáveis e Funções

- `camelCase` para variáveis, funções e hooks.
- `PascalCase` para componentes.
- `UPPER_SNAKE_CASE` apenas para constantes globais (ex: `ITEMS_PER_PAGE`).

Nomes de hooks:

- `useVoteFlow`
- `useContestData`
- `useResultsData`
- `useAuthGuard`

---

### 2.4. Hooks

- Lógica de negócio deve ficar em **hooks** ou nas páginas `Page.tsx`.
- Componentes de apresentação (`Neon*`, `NomineeCard`, `ResultsSlide`) não devem fazer chamadas ao Supabase.

---

## 3. Estilo Visual (Neon Night Show)

### 3.1. Paleta

- Fundo: `#05051A`
- Primária (roxo neon): `#8B5CF6`
- Secundária (ciano): `#22D3EE`
- Acento (amarelo): `#FACC15`
- Sucesso: `#22C55E`
- Erro: `#EF4444`

### 3.2. Tailwind (quando usado)

- Usar classes utilitárias para:
  - layout,
  - tipografia,
  - margem/padding,
  - cores de texto e fundo.

- Exemplo de card Neon:

```tsx
<div className="rounded-xl bg-slate-900/70 border border-violet-500/60 shadow-[0_0_25px_rgba(139,92,246,0.6)] p-4">
  {/* conteúdo */}
</div>
```

- Não criar classes customizadas complexas se uma combinação de utilitárias resolver.

---

## 4. Tratamento de Erros e Estados

### 4.1. Na votação (`/`)

- Estados possíveis:
  - `loading`
  - `error`
  - `ready`
  - `alreadyVoted`
- Sempre que houver erro, exibir `<NeonAlert variant="error" />`.

### 4.2. Nos resultados (`/results`)

- Antes de `reveal_at`, nunca mostrar dados de votos.
- Depois de `reveal_at`, sempre tentar carregar:
  - dados agregados por categoria,
  - vencedor,
  - (opcional) 2º e 3º lugar.

---

## 5. Acessibilidade Básica

- `button` sempre com `type="button"` ou `type="submit"`.
- Imagens com `alt` descritivo.
- Botões e links com textos claros (“Confirmar e ir para a próxima”, não só ícones).

---

## 6. Boas Práticas com Supabase

- Nunca colocar URL ou chave diretamente no código:
  - Usar `import.meta.env.VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Não duplicar lógica de fetch em vários lugares:
  - Centralizar em hooks.

---

## 7. Convenções de Commits (opcional para humanos)

Se usado Git com commits manuais, seguir algo tipo:

- `feat: ...` – nova funcionalidade
- `fix: ...` – bugfix
- `chore: ...` – ajustes estruturais
- `style: ...` – ajuste visual sem lógica

---

## 8. O que a IA **não** deve fazer

- Criar novas rotas além de `/`, `/results` e `/admin`.
- Alterar fluxo de votação para não ser carrossel categoria a categoria.
- Remover ou ignorar a constraint `UNIQUE (voter_id, category_id)`.
- Exigir login na rota `/`.
- Criar componentes sem antes descrever sua API em `COMPONENTS.md`.
- Ignorar a paleta Neon Night Show sem justificativa explícita.

---

_Fim do STYLE_GUIDE.md_
