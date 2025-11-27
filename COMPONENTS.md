# COMPONENTS.md – Quarteto Awards

Este documento define o **design system mínimo** e os **contratos de componentes** para o frontend.  
O objetivo é impedir que a IA “invente” componentes ou APIs diferentes a cada implementação.

Todos os componentes aqui descritos devem ser usados e mantidos consistentes.

---

## 1. Convenções Gerais

- Todos os componentes são **React Function Components**.
- Todos são escritos em **TypeScript** com props tipadas via `type` ou `interface`.
- Nomes de componentes em **PascalCase**.
- Preferir composição (props.children) a herança.

---

## 2. Componentes Neon Genéricos

### 2.1. `NeonButton`

Botão padrão do sistema.

**Local:** `src/components/neon/NeonButton.tsx`

**Responsabilidade:**

- Botão com estilo Neon Night Show.
- Três variações: `primary`, `secondary`, `ghost`.

**Tipo de props:**

```ts
export type NeonButtonVariant = "primary" | "secondary" | "ghost";
export type NeonButtonSize = "sm" | "md" | "lg";

export type NeonButtonProps = {
  variant?: NeonButtonVariant;
  size?: NeonButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
};
```

---

### 2.2. `NeonCard`

Card genérico com glow neon, usado em nominees, slides, etc.

**Local:** `src/components/neon/NeonCard.tsx`

**Responsabilidade:**

- Container com borda neon, usado para:
  - nominees
  - cards de resultado
  - blocos de destaque.

**Tipo de props:**

```ts
export type NeonCardProps = {
  selected?: boolean;
  onClick?: () => void;
  imageUrl?: string | null;
  title: string;
  subtitle?: string | null;
  children?: React.ReactNode;
};
```

---

### 2.3. `NeonBadge`

Badge pequeno, para marcar status (ex: “Vencedor”, “2º lugar”).

**Local:** `src/components/neon/NeonBadge.tsx`

```ts
export type NeonBadgeVariant = "winner" | "second" | "third" | "info";

export type NeonBadgeProps = {
  variant?: NeonBadgeVariant;
  children: React.ReactNode;
};
```

---

### 2.4. `NeonAlert`

Bloco de mensagem para erros, infos, avisos.

**Local:** `src/components/neon/NeonAlert.tsx`

```ts
export type NeonAlertVariant = "info" | "success" | "warning" | "error";

export type NeonAlertProps = {
  variant: NeonAlertVariant;
  title?: string;
  message: string;
};
```

---

## 3. Componentes de Layout

### 3.1. `PageContainer`

Define margens e largura máxima.

**Local:** `src/components/layout/PageContainer.tsx`

```ts
export type PageContainerProps = {
  children: React.ReactNode;
};
```

---

### 3.2. `NeonHeader` e `NeonFooter`

Cabeçalho e rodapé usados em todas as páginas públicas.

**Local:**

- `src/components/layout/NeonHeader.tsx`
- `src/components/layout/NeonFooter.tsx`

```ts
export type NeonHeaderProps = {
  title: string;
  subtitle?: string;
};

export type NeonFooterProps = {
  children?: React.ReactNode;
};
```

---

## 4. Componentes da Votação (`modules/public/vote/components`)

### 4.1. `CategoryStep`

Responsável por exibir **uma categoria** do carrossel mágico.

**Local:** `src/modules/public/vote/components/CategoryStep.tsx`

```ts
import type { Category, Nominee } from "../../../types/domain";

export type CategoryStepProps = {
  category: Category;
  nominees: Nominee[];
  selectedNomineeId?: string | null;
  onSelectNominee: (nomineeId: string) => void;
  onConfirm: () => void;
  isLastCategory: boolean;
  stepIndex: number;
  totalSteps: number;
};
```

**Comportamento:**

- Exibe título da categoria.
- Exibe descrição, se existir.
- Renderiza `<NomineeGrid />`.
- Renderiza `<VoteProgressBar />`.
- Renderiza `<NeonButton />`:
  - Desabilitado enquanto `selectedNomineeId` for `null`.
  - Texto diferente dependendo de `isLastCategory`.

---

### 4.2. `NomineeGrid`

Grid responsavel por posicionar até 6 candidatos.

**Local:** `src/modules/public/vote/components/NomineeGrid.tsx`

```ts
import type { Nominee } from "../../../types/domain";

export type NomineeGridProps = {
  nominees: Nominee[];
  selectedNomineeId?: string | null;
  onSelectNominee: (nomineeId: string) => void;
};
```

**Regras:**

- Layout mobile-first:
  - 2 colunas, até 3 linhas → 6 itens.
- Se tiver menos que 6:
  - Centralizar visualmente.
- Cada item é um `<NomineeCard />`.

---

### 4.3. `NomineeCard`

Card individual de um indicado.

**Local:** `src/modules/public/vote/components/NomineeCard.tsx`

```ts
import type { Nominee } from "../../../types/domain";

export type NomineeCardProps = {
  nominee: Nominee;
  selected: boolean;
  onSelect: () => void;
};
```

**Comportamento:**

- Usa `<NeonCard />` internamente.
- Quando `selected = true`, aplica glow extra.
- Clicar chama `onSelect`.

---

### 4.4. `VoteProgressBar`

Exibe “Categoria X de Y” e uma barra de progresso.

**Local:** `src/modules/public/vote/components/VoteProgressBar.tsx`

```ts
export type VoteProgressBarProps = {
  current: number; // 1-based
  total: number;
};
```

---

## 5. Componentes de Resultados (`modules/public/results/components`)

### 5.1. `CountdownTeaser`

Mostra teaser antes de `reveal_at`.

**Local:** `src/modules/public/results/components/CountdownTeaser.tsx`

```ts
export type CountdownTeaserProps = {
  contestName: string;
  revealAt: string; // ISO
};
```

---

### 5.2. `ResultsCarousel`

Carrossel de vencedores (pós-revelação).

**Local:** `src/modules/public/results/components/ResultsCarousel.tsx`

```ts
export type WinnerEntry = {
  categoryId: string;
  categoryName: string;
  winner: {
    nomineeId: string;
    name: string;
    imageUrl?: string | null;
    votes: number;
    percentage: number;
  };
  second?: {
    nomineeId: string;
    name: string;
    votes: number;
    percentage: number;
  } | null;
  third?: {
    nomineeId: string;
    name: string;
    votes: number;
    percentage: number;
  } | null;
};

export type ResultsCarouselProps = {
  entries: WinnerEntry[];
  autoPlay?: boolean;
  autoPlayIntervalMs?: number;
  onAutoPlayChange?: (autoPlay: boolean) => void;
};
```

---

### 5.3. `ResultsSlide`

Responsável por renderizar UM slide do carrossel.

**Local:** `src/modules/public/results/components/ResultsSlide.tsx`

```ts
export type ResultsSlideProps = {
  entry: WinnerEntry;
  index: number;
  total: number;
};
```

---

### 5.4. `ResultsSummaryTable`

Tabela com resumo de vencedores.

**Local:** `src/modules/public/results/components/ResultsSummaryTable.tsx`

```ts
export type ResultsSummaryRow = {
  categoryName: string;
  winnerName: string;
  votes: number;
  percentage: number;
};

export type ResultsSummaryTableProps = {
  rows: ResultsSummaryRow[];
};
```

---

## 6. Componentes de Admin

Não precisam ser tão “neon” quanto o público, mas devem ser consistentes.

Principais:

- `AdminShell`
- `ContestList`
- `ContestForm`
- `CategoryList`
- `CategoryForm`
- `NomineeList`
- `NomineeForm`
- `VoterList`
- `VoterForm`
- `AdminResultsTable`

Cada um deve ter props simples, baseadas em dados tipados de `types/domain.ts`.

---

## 7. Restrições

- Não criar novos componentes “Neon” com API diferente sem atualizar este arquivo.
- Não criar variações escondidas de `NomineeCard`/`NeonButton`: sempre reutilizar.
- Se for necessário um novo componente compartilhado, ele deve ser descrito primeiro em `COMPONENTS.md`.

---

_Fim do COMPONENTS.md_
