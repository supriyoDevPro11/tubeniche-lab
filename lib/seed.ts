import type { Niche, AppData, Settings, VideoIdea, Asset, ChecklistItem, CapCutStep } from './types';
import { DEFAULT_WEIGHTS } from './scoring';

export const uid = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  weights: DEFAULT_WEIGHTS,
  ownerName: 'Creator',
};

const mkCheck = (label: string, hint: string): ChecklistItem => ({
  id: uid(), label, hint, done: false,
});

const mkCapCut = (label: string, hint: string, script: string): CapCutStep => ({
  id: uid(), label, hint, script, done: false,
});

const mkIdea = (title: string, hook: string, format: string, cta: string, difficulty: VideoIdea['difficulty']): VideoIdea => ({
  id: uid(), title, hook, format, cta, difficulty, done: false,
});

const mkAsset = (name: string, kind: Asset['kind'], source: string, license: string, cost: string, status: Asset['status'], note = ''): Asset => ({
  id: uid(), name, kind, source, license, cost, status, note,
});

/** Standard editing pipeline used for new niches. */
export function defaultEditing(): ChecklistItem[] {
  return [
    mkCheck('Define hook & narrative arc', 'First 3 seconds decide everything. Write the hook before anything else.'),
    mkCheck('Script + shot list', 'Beat-by-beat script with matching B-roll notes.'),
    mkCheck('Record VO / on-camera', 'Clean audio, 48kHz. Room tone for 10s.'),
    mkCheck('Collect B-roll & assets', 'Fill every shot-list gap; log licenses as you go.'),
    mkCheck('Rough cut (story)', 'Cut for story only — ignore polish. Target 60–70% of final length.'),
    mkCheck('Tighten pacing', 'Kill dead air, tighten every cut by 4–8 frames.'),
    mkCheck('Sound design + music bed', 'Duck music under VO; SFX on every transition that needs it.'),
    mkCheck('Captions & subtitles', 'Burn-in captions, high contrast, safe margins.'),
    mkCheck('Color grade + LUT', 'Match shots, then apply consistent look.'),
    mkCheck('Thumbnail (3 variants)', 'One concept, three expressions/angles. Test the face.'),
    mkCheck('Title, description, tags', 'Keyword in first 60 chars of title.'),
    mkCheck('End screen + cards', 'Point to the next best video, not just the channel.'),
  ];
}

/** CapCut-specific pipeline mirroring the local .ps1 automation scripts. */
export function defaultCapCut(): CapCutStep[] {
  return [
    mkCapCut('Create project folder structure', 'raw/ audio/ assets/ exports/ thumbnails/', 'New-Item -ItemType Directory -Force raw,audio,assets,exports,thumbnails'),
    mkCapCut('Import media & proxy', 'Drop all footage, generate proxies for 4K sources.', 'Open CapCut → Import → Create proxy'),
    mkCapCut('Build timeline from shot list', 'Match each shot-list beat to the imported clip.', 'rebuild_timeline.ps1'),
    mkCapCut('Align VO to beats', 'Snap voiceover cuts to the beat grid before trimming visuals.', 'align_beats.ps1'),
    mkCapCut('Verify alignment', 'Check every VO segment lands on its intended beat.', 'check_alignment.ps1'),
    mkCapCut('Finalize clip timings', 'Lock durations; no more structural edits after this.', 'finalize_timings.ps1'),
    mkCapCut('Append stock B-roll', 'Fill remaining gaps with licensed stock.', 'append_stock.ps1'),
    mkCapCut('Fit template / safe zones', 'Keep text inside the 9:16 + 16:9 safe areas.', 'fit_template.ps1'),
    mkCapCut('Auto-captions pass', 'Generate, then fix names & jargon manually.', 'CapCut → Text → Auto captions'),
    mkCapCut('Export draft & verify duration', 'Confirm runtime matches the script target.', 'verify_draft.ps1'),
    mkCapCut('Export master (H.264, high bitrate)', '16:9 1080p master + 9:16 Shorts cut.', 'CapCut → Export → 1080p 20Mbps'),
  ];
}

/** A fully-populated blank niche template. */
export function blankNiche(name = 'New Niche'): Niche {
  const now = Date.now();
  return {
    id: uid(),
    name,
    emoji: '🎯',
    category: 'Tech',
    color: '#8b5cf6',
    favorite: false,
    stage: 'idea',
    notes: '',
    createdAt: now,
    updatedAt: now,
    trend: {
      score: 50,
      momentum: 'stable',
      searchVolume: '—',
      history: [40, 44, 43, 48, 52, 50, 55, 58, 56, 60],
      keywords: [],
    },
    virality: {
      potential: 50,
      shareability: 50,
      avgViews: '—',
      subGrowth: '—',
      formats: [],
      hooks: [],
    },
    competition: {
      score: 50,
      saturation: 'medium',
      topChannels: 0,
      viewsPerSub: '—',
      monetization: 'medium',
      gaps: [],
    },
    videoPlan: {
      pillars: [],
      ideas: [],
      editing: defaultEditing(),
      capcut: defaultCapCut(),
      projectPath: 'raw/ audio/ assets/ exports/ thumbnails/',
    },
    assets: [],
    activity: [{ id: uid(), at: now, text: 'Niche created' }],
  };
}

/* ---------------- SEED DATA ---------------- */

const seedNiche = (n: Partial<Niche> & Pick<Niche, 'name' | 'emoji' | 'category' | 'color'>): Niche => {
  const base = blankNiche(n.name);
  return { ...base, ...n, updatedAt: Date.now() - Math.floor(Math.random() * 6e8) };
};

export const SEED_NICHES: Niche[] = [
  seedNiche({
    name: 'AI Tool Teardowns',
    emoji: '🤖',
    category: 'Tech',
    color: '#8b5cf6',
    favorite: true,
    stage: 'scripted',
    notes: 'Fast-moving. Ship within 48h of a release or the niche floods.',
    trend: { score: 92, momentum: 'rising', searchVolume: '1.2M/mo', history: [42, 48, 55, 61, 68, 74, 79, 85, 89, 92], keywords: ['ai tools 2026', 'chatgpt tutorial', 'ai workflow', 'best ai apps'] },
    virality: { potential: 88, shareability: 82, avgViews: '180K', subGrowth: '+14%/mo', formats: ['Screen-recording explainer', 'Before/after workflow', 'Top 5 list'], hooks: ['"This AI tool replaced my $2,000/mo editor"', '"I tested 47 AI tools so you don\'t have to"', '"Stop paying for this — here\'s the free version"'] },
    competition: { score: 74, saturation: 'high', topChannels: 240, viewsPerSub: '0.9x', monetization: 'easy', gaps: ['Real-world cost breakdowns', 'Failure/skeptic angle', 'Non-English workflows'] },
    videoPlan: {
      pillars: ['Tool reviews', 'Workflow builds', 'Cost comparisons'],
      ideas: [
        mkIdea('I Replaced My Entire Editing Stack With AI', 'Show the $/mo saved in the first 5 seconds.', 'Screen-recording explainer', 'Download the stack list', 'medium'),
        mkIdea('7 AI Tools That Feel Illegal to Know', 'Count down fast, no fluff, cut every 3s.', 'Top 7 list', 'Comment your favorite', 'easy'),
      ],
      editing: defaultEditing(),
      capcut: defaultCapCut(),
      projectPath: 'D:/Projects/ai-teardowns/',
    },
    assets: [
      mkAsset('Screen recording kit', 'tool', 'OBS Studio', 'Free / GPL', '$0', 'downloaded', '1920x1080 60fps'),
      mkAsset('Tech B-roll pack', 'broll', 'Pexels', 'CC0', '$0', 'ready', 'Circuit boards, code closeups'),
      mkAsset('Ambient synth bed', 'music', 'Epidemic Sound', 'Subscription', '$15/mo', 'downloaded', 'Tech/ambient category'),
      mkAsset('UI click SFX', 'sfx', 'Freesound', 'CC-BY', '$0', 'needed', 'Need 6 variations'),
      mkAsset('Inter font family', 'font', 'Google Fonts', 'OFL', '$0', 'downloaded', 'Used for lower-thirds'),
    ],
    activity: [
      { id: uid(), at: Date.now() - 36e5, text: 'Script approved for AI editing stack video' },
      { id: uid(), at: Date.now() - 864e5, text: 'Trend score updated 85 → 92' },
    ],
  }),

  seedNiche({
    name: 'Micro-Budget Cooking',
    emoji: '🍜',
    category: 'Food',
    color: '#f59e0b',
    favorite: true,
    stage: 'edited',
    notes: 'High virality on Shorts. Full-length does better on retention than expected.',
    trend: { score: 78, momentum: 'rising', searchVolume: '740K/mo', history: [52, 54, 58, 57, 62, 66, 69, 71, 75, 78], keywords: ['cheap meals', '$5 dinner', 'budget cooking', 'student recipes'] },
    virality: { potential: 91, shareability: 88, avgViews: '420K', subGrowth: '+22%/mo', formats: ['Shorts recipe', 'Cost-per-plate breakdown', 'One-pan challenge'], hooks: ['"Full meal for less than a coffee"', '"I fed 4 people for $6"', '"The grocery store doesn\'t want you to know this"'] },
    competition: { score: 58, saturation: 'medium', topChannels: 96, viewsPerSub: '2.4x', monetization: 'medium', gaps: ['Regional cuisine angles', 'Nutrition + cost combined', 'Meal-prep for one'] },
    videoPlan: {
      pillars: ['$5 dinners', 'One-pan series', 'Grocery hauls'],
      ideas: [
        mkIdea('$5 Dinner That Tastes Like $50', 'Show the receipt first, then the plate.', 'Shorts recipe', 'Save for later', 'easy'),
        mkIdea('I Cooked a Week of Meals for $20', 'Show the empty fridge, then the full week.', 'Challenge', 'Subscribe for part 2', 'medium'),
      ],
      editing: defaultEditing(),
      capcut: defaultCapCut(),
      projectPath: 'D:/Projects/budget-cooking/',
    },
    assets: [
      mkAsset('Top-down food rig', 'tool', 'DIY rig', 'Owned', '$0', 'downloaded', 'Overhead + 45° angles'),
      mkAsset('Sizzle SFX pack', 'sfx', 'Soundly', 'Subscription', '$10/mo', 'ready', 'Sear, chop, boil'),
      mkAsset('Warm kitchen LUT', 'lut', 'Own pack', 'Owned', '$0', 'downloaded', 'Slight orange lift'),
      mkAsset('Recipe card template', 'image', 'Figma', 'Owned', '$0', 'downloaded', '9:16 and 16:9'),
    ],
    activity: [
      { id: uid(), at: Date.now() - 72e5, text: 'Moved to Edited stage' },
      { id: uid(), at: Date.now() - 3 * 864e5, text: 'Added 4 assets to library' },
    ],
  }),

  seedNiche({
    name: 'Cozy Game Longplays',
    emoji: '🎮',
    category: 'Gaming',
    color: '#22d3ee',
    favorite: false,
    stage: 'research',
    notes: 'Low competition but slow monetization. Good for watch-time, weak for RPM.',
    trend: { score: 66, momentum: 'stable', searchVolume: '390K/mo', history: [58, 60, 62, 61, 63, 65, 64, 66, 65, 66], keywords: ['cozy games', 'relaxing gameplay', 'no commentary', 'stardew valley'] },
    virality: { potential: 54, shareability: 41, avgViews: '95K', subGrowth: '+5%/mo', formats: ['No-commentary longplay', 'Cozy tier list', 'First 30 minutes'], hooks: ['"The most relaxing game of 2026"', '"Play this instead of doomscrolling"'] },
    competition: { score: 41, saturation: 'low', topChannels: 38, viewsPerSub: '1.8x', monetization: 'hard', gaps: ['Curated cozy playlists', 'Cozy + ASMR crossover', 'Reviews for non-gamers'] },
    videoPlan: {
      pillars: ['Longplays', 'Cozy tier lists', 'Chill reviews'],
      ideas: [
        mkIdea('The Coziest Game Nobody Is Playing', 'Open on the most beautiful screenshot in the game.', 'Review', 'Wishlist in description', 'easy'),
      ],
      editing: defaultEditing(),
      capcut: defaultCapCut(),
      projectPath: 'D:/Projects/cozy-games/',
    },
    assets: [
      mkAsset('Game capture setup', 'tool', 'OBS + Elgato', 'Owned', '$0', 'downloaded', '1080p60'),
      mkAsset('Lo-fi music pack', 'music', 'Lofi Girl licensed', 'Licensed', '$0', 'ready', 'Attribution required'),
    ],
    activity: [{ id: uid(), at: Date.now() - 5 * 864e5, text: 'Competition analysis completed' }],
  }),

  seedNiche({
    name: 'Excel & Sheets Power Moves',
    emoji: '📊',
    category: 'Business',
    color: '#a3e635',
    favorite: false,
    stage: 'published',
    notes: 'Evergreen. Each video keeps earning for years. Low ceiling per video, high floor.',
    trend: { score: 61, momentum: 'stable', searchVolume: '1.8M/mo', history: [62, 63, 61, 62, 60, 61, 62, 61, 60, 61], keywords: ['excel tips', 'google sheets formulas', 'spreadsheet tutorial', 'excel hacks'] },
    virality: { potential: 62, shareability: 74, avgViews: '140K', subGrowth: '+8%/mo', formats: ['60-second tip', 'Formula breakdown', 'Template giveaway'], hooks: ['"This one formula saved me 6 hours"', '"You\'re using VLOOKUP wrong"'] },
    competition: { score: 82, saturation: 'high', topChannels: 420, viewsPerSub: '0.7x', monetization: 'easy', gaps: ['Industry-specific templates', 'Automation + AI combo', 'Real job scenarios'] },
    videoPlan: {
      pillars: ['Power tips', 'Template drops', 'Job scenarios'],
      ideas: [
        mkIdea('The Formula That Got Me Promoted', 'Show the before/after spreadsheet.', '60-second tip', 'Grab the template', 'easy'),
      ],
      editing: defaultEditing(),
      capcut: defaultCapCut(),
      projectPath: 'D:/Projects/excel-moves/',
    },
    assets: [
      mkAsset('Screen recorder', 'tool', 'Camtasia', 'Owned', '$0', 'downloaded', 'Cursor highlighting on'),
      mkAsset('Clean UI music bed', 'music', 'Artlist', 'Subscription', '$9/mo', 'downloaded', ''),
      mkAsset('Spreadsheet templates', 'stock', 'Own bank', 'Owned', '$0', 'downloaded', '24 templates'),
    ],
    activity: [{ id: uid(), at: Date.now() - 12 * 864e5, text: 'Video published: "The Formula That Got Me Promoted"' }],
  }),

  seedNiche({
    name: 'Restoration & Repair ASMR',
    emoji: '🔧',
    category: 'DIY & Craft',
    color: '#fb7185',
    favorite: true,
    stage: 'recorded',
    notes: 'No talking needed. Massive international reach. Very low RPM but huge view counts.',
    trend: { score: 84, momentum: 'rising', searchVolume: '520K/mo', history: [48, 52, 57, 61, 66, 70, 73, 78, 81, 84], keywords: ['restoration video', 'rust removal', 'repair asmr', 'satisfying restoration'] },
    virality: { potential: 95, shareability: 90, avgViews: '1.1M', subGrowth: '+31%/mo', formats: ['Full restoration', 'Before/after Short', 'Oddly satisfying compilation'], hooks: ['"40 years of rust, 20 minutes"', '"This was in a landfill"'] },
    competition: { score: 63, saturation: 'medium', topChannels: 112, viewsPerSub: '3.1x', monetization: 'medium', gaps: ['Niche object categories (watches, tools)', 'Tool-only restorations', 'Repair + story hybrid'] },
    videoPlan: {
      pillars: ['Full restorations', 'Satisfying Shorts', 'Tool teardowns'],
      ideas: [
        mkIdea('Restoring a 1962 Rusted Watch', 'Start on the finished piece, then cut to the rust.', 'Full restoration', 'Part 2 coming', 'hard'),
      ],
      editing: defaultEditing(),
      capcut: defaultCapCut(),
      projectPath: 'D:/Projects/restoration/',
    },
    assets: [
      mkAsset('Macro lens', 'tool', 'Laowa 100mm', 'Owned', '$0', 'downloaded', '2:1 macro'),
      mkAsset('High-key lighting', 'tool', '2x softbox', 'Owned', '$0', 'downloaded', 'Neutral white'),
      mkAsset('Restoration SFX', 'sfx', 'Own recordings', 'Owned', '$0', 'ready', 'Brushing, scraping, clicks'),
    ],
    activity: [
      { id: uid(), at: Date.now() - 2 * 36e5, text: 'Recording session complete' },
      { id: uid(), at: Date.now() - 6 * 864e5, text: 'Trend rising flag added' },
    ],
  }),

  seedNiche({
    name: 'Stoic Life Systems',
    emoji: '🏛️',
    category: 'Lifestyle',
    color: '#60a5fa',
    favorite: false,
    stage: 'idea',
    notes: 'Overlapping with generic self-help. Needs a sharper angle to stand out.',
    trend: { score: 47, momentum: 'falling', searchVolume: '210K/mo', history: [72, 68, 65, 61, 58, 55, 53, 50, 48, 47], keywords: ['stoicism', 'discipline routine', 'morning routine', 'self improvement'] },
    virality: { potential: 44, shareability: 52, avgViews: '65K', subGrowth: '-3%/mo', formats: ['Essay voiceover', 'Routine breakdown'], hooks: ['"Marcus Aurelius on mornings"', '"Stop optimizing, start choosing"'] },
    competition: { score: 88, saturation: 'high', topChannels: 610, viewsPerSub: '0.4x', monetization: 'hard', gaps: ['Anti-routine angle', 'Stoicism for tradespeople', 'Skeptical/critical take'] },
    videoPlan: {
      pillars: ['Essays', 'Routine deconstructions'],
      ideas: [
        mkIdea('Why Your Morning Routine Is Making You Worse', 'Open by quoting the most-copied routine on the internet.', 'Essay voiceover', 'Read the source', 'easy'),
      ],
      editing: defaultEditing(),
      capcut: defaultCapCut(),
      projectPath: 'D:/Projects/stoic-systems/',
    },
    assets: [
      mkAsset('Marble / statue B-roll', 'broll', 'Pexels', 'CC0', '$0', 'needed', 'Greece, statues, columns'),
      mkAsset('Cinematic orchestral', 'music', 'Epidemic Sound', 'Subscription', '$15/mo', 'needed', 'Slow build'),
    ],
    activity: [{ id: uid(), at: Date.now() - 8 * 864e5, text: 'Niche flagged as falling — needs new angle' }],
  }),
];

export function seedData(): AppData {
  return { version: 1, niches: SEED_NICHES, settings: DEFAULT_SETTINGS };
}
