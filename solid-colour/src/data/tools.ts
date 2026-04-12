export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'Icons' | 'Fonts' | 'Color' | 'Animation' | 'CSS' | 'AI';
  pricing: 'Free' | 'Free + Pro' | 'Paid';
  initials: string;
  accent: string;
}

export const tools: Tool[] = [
  // Icons
  {
    id: 'lucide',
    name: 'Lucide',
    description: '1,500+ open-source icons. Consistent stroke, framework agnostic.',
    url: 'https://lucide.dev',
    category: 'Icons',
    pricing: 'Free',
    initials: 'Lu',
    accent: '#F56565',
  },
  {
    id: 'heroicons',
    name: 'Heroicons',
    description: '24×24 SVG icons by the makers of Tailwind. Outline + solid + mini variants.',
    url: 'https://heroicons.com',
    category: 'Icons',
    pricing: 'Free',
    initials: 'He',
    accent: '#06B6D4',
  },
  {
    id: 'phosphor',
    name: 'Phosphor Icons',
    description: '6,000+ icons in six weights — thin, light, regular, bold, fill, duotone.',
    url: 'https://phosphoricons.com',
    category: 'Icons',
    pricing: 'Free',
    initials: 'Ph',
    accent: '#9333EA',
  },
  {
    id: 'tabler',
    name: 'Tabler Icons',
    description: '5,800+ pixel-perfect SVG icons under MIT.',
    url: 'https://tabler.io/icons',
    category: 'Icons',
    pricing: 'Free',
    initials: 'Tb',
    accent: '#0070F3',
  },
  {
    id: 'iconify',
    name: 'Iconify',
    description: '200,000+ icons from 150+ icon sets, on demand. Single API, every framework.',
    url: 'https://iconify.design',
    category: 'Icons',
    pricing: 'Free',
    initials: 'If',
    accent: '#1769AA',
  },
  {
    id: 'radix-icons',
    name: 'Radix Icons',
    description: '15×15 SVG icons designed by the WorkOS / Radix team — clean, geometric.',
    url: 'https://www.radix-ui.com/icons',
    category: 'Icons',
    pricing: 'Free',
    initials: 'Ri',
    accent: '#5E6AD2',
  },

  // Fonts
  {
    id: 'google-fonts',
    name: 'Google Fonts',
    description: '1,500+ open-source font families with variable weights. Free for any use.',
    url: 'https://fonts.google.com',
    category: 'Fonts',
    pricing: 'Free',
    initials: 'Gf',
    accent: '#4285F4',
  },
  {
    id: 'fontshare',
    name: 'Fontshare',
    description:
      'Free font service from Indian Type Foundry. Display-grade, paid-quality fonts, free.',
    url: 'https://www.fontshare.com',
    category: 'Fonts',
    pricing: 'Free',
    initials: 'Fs',
    accent: '#000000',
  },
  {
    id: 'use-and-modify',
    name: 'Use & Modify',
    description: 'Curated open-source fonts. Editable licenses, professional quality.',
    url: 'https://usemodify.com',
    category: 'Fonts',
    pricing: 'Free',
    initials: 'Um',
    accent: '#1F1F1F',
  },
  {
    id: 'adobe-fonts',
    name: 'Adobe Fonts',
    description:
      'Foundry fonts via Creative Cloud. Strong type system, sync across desktop and web.',
    url: 'https://fonts.adobe.com',
    category: 'Fonts',
    pricing: 'Paid',
    initials: 'Af',
    accent: '#FA0F00',
  },

  // Color
  {
    id: 'coolors',
    name: 'Coolors',
    description: 'Generate palettes and explore trending color schemes. Quick contrast checks.',
    url: 'https://coolors.co',
    category: 'Color',
    pricing: 'Free + Pro',
    initials: 'Cl',
    accent: '#1DCAA1',
  },
  {
    id: 'realtime-colors',
    name: 'Realtime Colors',
    description: 'Test color palettes on a real-looking site. See contrast, hierarchy, vibe live.',
    url: 'https://realtimecolors.com',
    category: 'Color',
    pricing: 'Free',
    initials: 'Rc',
    accent: '#000000',
  },
  {
    id: 'uicolors',
    name: 'UI Colors',
    description: 'Generate Tailwind color shades from a single hex. Snap-to-WCAG palette tool.',
    url: 'https://uicolors.app',
    category: 'Color',
    pricing: 'Free',
    initials: 'Uc',
    accent: '#06B6D4',
  },
  {
    id: 'khroma',
    name: 'Khroma',
    description: 'AI color tool that learns your taste from 50 picks, then suggests palettes.',
    url: 'https://www.khroma.co',
    category: 'Color',
    pricing: 'Free',
    initials: 'Kh',
    accent: '#FF6E61',
  },

  // Animation
  {
    id: 'lottiefiles',
    name: 'LottieFiles',
    description: 'Free Lottie animations and an editor. JSON animations for web, iOS and Android.',
    url: 'https://lottiefiles.com',
    category: 'Animation',
    pricing: 'Free + Pro',
    initials: 'Lf',
    accent: '#00DDB3',
  },
  {
    id: 'rive',
    name: 'Rive',
    description:
      'State-machine animation tool for interactive graphics. Runtime for web and native.',
    url: 'https://rive.app',
    category: 'Animation',
    pricing: 'Free + Pro',
    initials: 'Rv',
    accent: '#1B1B1B',
  },
  {
    id: 'framer-motion',
    name: 'Framer Motion',
    description:
      'Production-ready motion library for React. Layout animations, gestures, variants.',
    url: 'https://www.framer.com/motion',
    category: 'Animation',
    pricing: 'Free',
    initials: 'Fm',
    accent: '#0099FF',
  },

  // CSS / build
  {
    id: 'tailwindcss',
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework. The default for component libraries in this list.',
    url: 'https://tailwindcss.com',
    category: 'CSS',
    pricing: 'Free',
    initials: 'Tw',
    accent: '#06B6D4',
  },
  {
    id: 'unocss',
    name: 'UnoCSS',
    description: 'Instant on-demand atomic CSS engine. Tailwind-compatible, dramatically faster.',
    url: 'https://unocss.dev',
    category: 'CSS',
    pricing: 'Free',
    initials: 'Un',
    accent: '#22D3EE',
  },
  {
    id: 'panda-css',
    name: 'Panda CSS',
    description:
      'Build-time CSS-in-JS with type-safe styling and tokens. Zero runtime, atomic output.',
    url: 'https://panda-css.com',
    category: 'CSS',
    pricing: 'Free',
    initials: 'Pa',
    accent: '#F472B6',
  },

  // AI / generation
  {
    id: 'v0',
    name: 'v0 by Vercel',
    description:
      'AI UI generator that outputs shadcn/ui + Tailwind React code. Iterate on screenshots.',
    url: 'https://v0.dev',
    category: 'AI',
    pricing: 'Free + Pro',
    initials: 'v0',
    accent: '#000000',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'AI-first code editor — paste designs, ask for components, refactor in-place.',
    url: 'https://cursor.com',
    category: 'AI',
    pricing: 'Free + Pro',
    initials: 'Cr',
    accent: '#000000',
  },
  {
    id: 'figma-make',
    name: 'Figma Make',
    description: 'AI prompt-to-app inside Figma. Turn designs and prompts into working code.',
    url: 'https://www.figma.com/make',
    category: 'AI',
    pricing: 'Free + Pro',
    initials: 'Fk',
    accent: '#F24E1E',
  },
];
