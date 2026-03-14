export type View = 'landing' | 'dashboard' | 'marketplace' | 'project-chat' | 'team' | 'settings' | 'disputes' | 'login' | 'signup' | 'admin';

export interface Project {
  id: number;
  title: string;
  client: string;
  budget: string;
  status: string;
  progress: number;
}

export interface Stat {
  label: string;
  value: string;
  change: string;
  icon: any;
  color: string;
  bg: string;
  emoji: string;
}

export interface Milestone {
  date: string;
  title: string;
  project: string;
  time: string;
  color: string;
}

export interface TeamMember {
  name: string;
  role: string;
  status: 'Active' | 'In Call' | 'Away';
  tasks: number;
  rating: number;
  emoji: string;
}
