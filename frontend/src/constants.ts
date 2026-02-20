import { Project, TeamMember, Milestone } from './types';

export const PROJECTS: Project[] = [
  { id: 1, title: 'E-commerce Platform Redesign', client: 'TechFlow Inc.', budget: '$4,500', status: 'In Progress', progress: 65 },
  { id: 2, title: 'AI Content Generator API', client: 'Nexus AI', budget: '$2,800', status: 'Milestone 2', progress: 40 },
  { id: 3, title: 'Mobile App UX Audit', client: 'GreenGrowth', budget: '$1,200', status: 'Completed', progress: 100 },
];

export const MILESTONES: Milestone[] = [
  { date: 'Oct 24', title: 'Final UI Mockups', project: 'E-commerce Redesign', time: '10:00 AM', color: 'bg-brand-100 text-brand-600' },
  { date: 'Oct 26', title: 'API Documentation', project: 'AI Generator', time: '02:30 PM', color: 'bg-blue-100 text-blue-600' },
  { date: 'Oct 28', title: 'Client Feedback Call', project: 'UX Audit', time: '04:00 PM', color: 'bg-orange-100 text-orange-600' },
];

export const TEAM_MEMBERS: TeamMember[] = [
  { name: 'Alex Rivera', role: 'UI Designer', status: 'Active', tasks: 12, rating: 4.9, emoji: '🎨' },
  { name: 'Sarah Chen', role: 'Backend Dev', status: 'In Call', tasks: 8, rating: 5.0, emoji: '💻' },
  { name: 'Marcus Bell', role: 'QA Engineer', status: 'Away', tasks: 15, rating: 4.8, emoji: '🐞' },
  { name: 'Elena Vance', role: 'Project Manager', status: 'Active', tasks: 5, rating: 4.9, emoji: '📅' },
];
