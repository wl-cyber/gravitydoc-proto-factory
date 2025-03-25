
export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Screen = {
  id: string;
  project_id: string;
  image_path: string;
  documentation: string | null;
  screen_name: string | null;
  plan_status: 'NOT_GENERATED' | 'IN_PROGRESS' | 'COMPLETED';
  implementation_plan: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
