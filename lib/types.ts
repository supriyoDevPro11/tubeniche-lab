export type Momentum = 'rising' | 'stable' | 'falling';
export type Stage = 'idea' | 'research' | 'scripted' | 'recorded' | 'edited' | 'published';
export type Saturation = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssetKind =
  | 'image' | 'broll' | 'music' | 'sfx' | 'font' | 'lut' | 'tool' | 'stock' | 'other';
export type AssetStatus = 'needed' | 'ready' | 'downloaded';

export interface VideoIdea {
  id: string;
  title: string;
  hook: string;
  format: string;
  cta: string;
  difficulty: Difficulty;
  done: boolean;
}

export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  source: string;
  license: string;
  cost: string;
  status: AssetStatus;
  note: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  hint: string;
  done: boolean;
}

export interface CapCutStep {
  id: string;
  label: string;
  hint: string;
  script: string;
  done: boolean;
}

export interface TrendData {
  score: number;
  momentum: Momentum;
  searchVolume: string;
  history: number[];
  keywords: string[];
}

export interface ViralityData {
  potential: number;
  shareability: number;
  avgViews: string;
  subGrowth: string;
  formats: string[];
  hooks: string[];
}

export interface CompetitionData {
  score: number;
  saturation: Saturation;
  topChannels: number;
  viewsPerSub: string;
  monetization: Difficulty;
  gaps: string[];
}

export interface VideoPlan {
  pillars: string[];
  ideas: VideoIdea[];
  editing: ChecklistItem[];
  capcut: CapCutStep[];
  projectPath: string;
}

export interface ActivityEntry {
  id: string;
  at: number;
  text: string;
}

export interface Niche {
  id: string;
  name: string;
  emoji: string;
  category: string;
  color: string;
  favorite: boolean;
  stage: Stage;
  notes: string;
  createdAt: number;
  updatedAt: number;
  trend: TrendData;
  virality: ViralityData;
  competition: CompetitionData;
  videoPlan: VideoPlan;
  assets: Asset[];
  activity: ActivityEntry[];
}

export interface Weights {
  trend: number;
  virality: number;
  competition: number;
}

export interface Settings {
  theme: 'dark' | 'light';
  weights: Weights;
  ownerName: string;
}

export interface AppData {
  version: number;
  niches: Niche[];
  settings: Settings;
}

export const STAGES: { id: Stage; label: string; icon: string; color: string }[] = [
  { id: 'idea', label: 'Idea', icon: '💡', color: '#a78bfa' },
  { id: 'research', label: 'Research', icon: '🔎', color: '#22d3ee' },
  { id: 'scripted', label: 'Scripted', icon: '📝', color: '#a3e635' },
  { id: 'recorded', label: 'Recorded', icon: '🎙️', color: '#f59e0b' },
  { id: 'edited', label: 'Edited', icon: '✂️', color: '#fb7185' },
  { id: 'published', label: 'Published', icon: '🚀', color: '#34d399' },
];

export const CATEGORIES = [
  'Tech', 'Gaming', 'Finance', 'Lifestyle', 'Food', 'Science',
  'Education', 'Fitness', 'Travel', 'Music', 'Business', 'Comedy',
  'DIY & Craft', 'Kids', 'Automotive', 'Health',
];

export const MOMENTUMS: { id: Momentum; label: string; icon: string; cls: string }[] = [
  { id: 'rising', label: 'Rising', icon: '▲', cls: 'trend-up' },
  { id: 'stable', label: 'Stable', icon: '▬', cls: 'trend-flat' },
  { id: 'falling', label: 'Falling', icon: '▼', cls: 'trend-down' },
];

export const ASSET_KINDS: { id: AssetKind; label: string; icon: string }[] = [
  { id: 'image', label: 'Images / Graphics', icon: '🖼️' },
  { id: 'broll', label: 'B-Roll / Footage', icon: '🎞️' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'sfx', label: 'Sound FX', icon: '🔊' },
  { id: 'font', label: 'Fonts', icon: '🔤' },
  { id: 'lut', label: 'LUTs / Color', icon: '🎨' },
  { id: 'tool', label: 'Tools / Apps', icon: '🛠️' },
  { id: 'stock', label: 'Stock Sources', icon: '📦' },
  { id: 'other', label: 'Other', icon: '📎' },
];

export const ASSET_STATUS: { id: AssetStatus; label: string; cls: string }[] = [
  { id: 'needed', label: 'Needed', cls: 'chip-coral' },
  { id: 'ready', label: 'Ready', cls: 'chip-amber' },
  { id: 'downloaded', label: 'Downloaded', cls: 'chip-emerald' },
];

export const THEME_COLORS = [
  '#8b5cf6', '#ec4899', '#f59e0b', '#22d3ee',
  '#a3e635', '#fb7185', '#34d399', '#60a5fa',
];
