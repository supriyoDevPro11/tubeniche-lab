import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TubeNiche Lab — YouTube Niche Research & Production Planner',
  description:
    'Plan YouTube niches end to end: trendiness, virality, competition, video production workflow, CapCut steps, and every asset you need.',
  applicationName: 'TubeNiche Lab',
  keywords: ['youtube niche', 'niche research', 'video planner', 'content strategy', 'capcut'],
};

export const viewport: Viewport = {
  themeColor: '#07060f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
