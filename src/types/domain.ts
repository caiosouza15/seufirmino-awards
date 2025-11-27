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
