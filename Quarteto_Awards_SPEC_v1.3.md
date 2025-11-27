# Quarteto Awards – Especificação do Projeto (v1.3)

Sistema de votação "Melhores do Ano" para um grupo fechado de 4 amigos, com links únicos por pessoa, frontend em **React + Vite + TypeScript** e backend em **Supabase**.

---

## 1. Visão Geral

O **Quarteto Awards** é um mini-sistema de votação divertido e anônimo entre amigos.

- Cada participante recebe um **link único** contendo um `token`.
- A votação é **anônima** (nenhum dado pessoal é coletado).
- Cada token pode votar **uma única vez por categoria**.
- Os votos são armazenados no **Supabase**.
- O frontend é uma **SPA em React + Vite + TS**.
- Tema visual principal: **Neon Night Show** (telas escuras, neon, carrosséis, experiência divertida).

Este documento é o **contrato oficial do projeto**.  
Qualquer IA ou desenvolvedor deve **seguir fielmente** o que está descrito aqui.

---

## 2. Stack Técnica

### 2.1. Frontend

- **Framework:** React  
- **Build tool:** Vite  
- **Linguagem:** TypeScript  
- **Estilo:** livre (CSS Modules, Tailwind ou outro)  
- **Arquitetura:** SPA  
- **Roteamento:** React Router (ou equivalente)  

### 2.2. Backend

- **Plataforma:** Supabase  
- **Banco:** PostgreSQL  
- **Autenticação:** Supabase Auth (somente admins)  
- **RLS:** obrigatório nas tabelas críticas  
- **SDK:** `@supabase/supabase-js`

---

## 3. Regras de Negócio

### 3.1. Público

- Exatamente **4 participantes**.
- Cada um recebe um link único com token, via WhatsApp.

### 3.2. Votação

- Votação **anônima**.
- Cada participante tem **um token exclusivo**.
- Cada token pode votar **uma vez por categoria**.
- As categorias são exibidas **uma por vez**, em um **carrossel mágico**.
- Os votos podem ser enviados:
  - a cada categoria, ou
  - todos de uma vez ao final.

### 3.3. Painel Administrativo

O sistema deve possuir um **painel admin** com:

- CRUD de **contests**.
- CRUD de **categories**.
- CRUD de **nominees**.
- Gerenciamento de **voters** (tokens).
- Visualização de **resultados**.

---

## 4. Modelo de Dados

Todas as tabelas abaixo devem existir no Supabase.

### 4.1. `contests`

- `id` – UUID  
- `name` – texto  
- `description` – opcional  
- `start_at` – datetime  
- `end_at` – datetime  
- `reveal_at` – datetime  
- `is_active` – boolean  
- `created_at` – datetime  

### 4.2. `categories`

- `id` – UUID  
- `contest_id` – UUID  
- `name` – texto  
- `description` – opcional  
- `sort_order` – int  

### 4.3. `nominees`

- `id` – UUID  
- `category_id` – UUID  
- `name` – texto  
- `description` – opcional  
- `image_url` – opcional  
- `sort_order` – int  

### 4.4. `voters`

- `id` – UUID  
- `contest_id` – UUID  
- `code` – string única  
- `is_active` – boolean  
- `created_at` – datetime  

### 4.5. `votes`

- `id` – UUID  
- `contest_id` – UUID  
- `category_id` – UUID  
- `nominee_id` – UUID  
- `voter_id` – UUID  
- `ip_address` – opcional  
- `user_agent` – opcional  
- `created_at` – datetime  

**Constraint obrigatória:**

```
UNIQUE (voter_id, category_id)
```

### 4.6. `admin_profiles`

- `user_id` – UUID  
- `created_at` – datetime  

---

## 5. Rotas da Aplicação

### 5.1. `/` — Página de Votação Pública

- Usa `/?token=<code>`
- Faz validação completa do token  
- Carrega contest, categorias e nominees  
- Exibe **carrossel mágico**  
- Envia votos  
- Exibe mensagem de sucesso  

### 5.2. `/results` — Página Pública de Resultados

- Antes de `reveal_at`: exibe teaser  
- Depois:
  - Carrossel de vencedores  
  - Dashboard de resumo  

### 5.3. `/admin` — Painel Administrativo

- Login com Supabase Auth  
- Verificação de `admin_profiles`  
- CRUD completo  
- Resultados internos  

---

## 6. Tipos (TypeScript)

```ts
export type Contest = {
  id: string;
  name: string;
  description?: string | null;
  start_at: string;
  end_at: string;
  reveal_at?: string | null;
  is_active: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  contest_id: string;
  name: string;
  description?: string | null;
  sort_order: number;
};

export type Nominee = {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  sort_order: number;
};

export type Voter = {
  id: string;
  contest_id: string;
  code: string;
  is_active: boolean;
  created_at: string;
};

export type Vote = {
  id: string;
  contest_id: string;
  category_id: string;
  nominee_id: string;
  voter_id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
};
```

---

## 7. Segurança & RLS

- `votes`:  
  - Permitir `INSERT`  
  - Bloquear `UPDATE` e `DELETE`  
- `admin_profiles`: restrito  
- Rotas públicas não devem exigir login  

---

## 8. Roadmap

1. Configurar Supabase  
2. Criar tabelas + RLS  
3. Criar projeto React  
4. Implementar `/`, `/results`, `/admin`  
5. Criar carrossel mágico  
6. Criar painel admin  
7. Testar com 4 tokens  
8. Revelação oficial  

---

## 9. Guidelines

- Não alterar nomes das rotas  
- Não remover `UNIQUE (voter_id, category_id)`  
- Não adicionar login na rota `/`  
- Tema **Neon Night Show** recomendado  
- Microcopy divertida  

---

**Fim da Especificação — v1.3**
