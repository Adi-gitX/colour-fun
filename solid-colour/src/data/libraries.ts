export interface Library {
  id: string;
  name: string;
  description: string;
  url: string;
  framework: ('React' | 'Vue' | 'Svelte' | 'Solid' | 'Universal' | 'CSS')[];
  styling: 'Tailwind' | 'CSS' | 'CSS-in-JS' | 'Unstyled' | 'Mixed';
  pricing: 'Free' | 'Free + Pro' | 'Paid';
  highlight?: string;
  initials: string;
  accent: string;
}

export const libraries: Library[] = [
  {
    id: 'shadcn-ui',
    name: 'shadcn/ui',
    description:
      'Beautifully designed components copy-pasted into your app. Built on Radix + Tailwind.',
    url: 'https://ui.shadcn.com',
    framework: ['React'],
    styling: 'Tailwind',
    pricing: 'Free',
    highlight: 'Copy-paste',
    initials: 'sh',
    accent: '#09090B',
  },
  {
    id: 'radix-ui',
    name: 'Radix UI',
    description:
      'Unstyled, accessible component primitives for building high-quality design systems.',
    url: 'https://www.radix-ui.com',
    framework: ['React'],
    styling: 'Unstyled',
    pricing: 'Free',
    initials: 'Rx',
    accent: '#5E6AD2',
  },
  {
    id: 'headlessui',
    name: 'Headless UI',
    description:
      'Completely unstyled, fully accessible UI components from the makers of Tailwind CSS.',
    url: 'https://headlessui.com',
    framework: ['React', 'Vue'],
    styling: 'Unstyled',
    pricing: 'Free',
    initials: 'Hl',
    accent: '#06B6D4',
  },
  {
    id: 'mantine',
    name: 'Mantine',
    description:
      'Full-featured React components and hooks library with a focus on usability and accessibility.',
    url: 'https://mantine.dev',
    framework: ['React'],
    styling: 'CSS-in-JS',
    pricing: 'Free',
    initials: 'Mt',
    accent: '#339AF0',
  },
  {
    id: 'chakra-ui',
    name: 'Chakra UI',
    description:
      'Simple, modular and accessible component library for React applications.',
    url: 'https://chakra-ui.com',
    framework: ['React'],
    styling: 'CSS-in-JS',
    pricing: 'Free',
    initials: 'Ch',
    accent: '#319795',
  },
  {
    id: 'mui',
    name: 'Material UI',
    description:
      'Comprehensive React UI library implementing Google Material Design with theming.',
    url: 'https://mui.com',
    framework: ['React'],
    styling: 'CSS-in-JS',
    pricing: 'Free + Pro',
    initials: 'MU',
    accent: '#007FFF',
  },
  {
    id: 'antd',
    name: 'Ant Design',
    description:
      'Enterprise-class UI design language and component library with rich data-heavy primitives.',
    url: 'https://ant.design',
    framework: ['React'],
    styling: 'CSS-in-JS',
    pricing: 'Free',
    initials: 'An',
    accent: '#1677FF',
  },
  {
    id: 'heroui',
    name: 'HeroUI',
    description:
      'Modern, fast React UI library (formerly NextUI) built on Tailwind Variants and React Aria.',
    url: 'https://www.heroui.com',
    framework: ['React'],
    styling: 'Tailwind',
    pricing: 'Free',
    highlight: 'Was NextUI',
    initials: 'He',
    accent: '#9353D3',
  },
  {
    id: 'tremor',
    name: 'Tremor',
    description:
      'React components for analytics dashboards. Charts, KPIs and tables, themed for clarity.',
    url: 'https://tremor.so',
    framework: ['React'],
    styling: 'Tailwind',
    pricing: 'Free + Pro',
    initials: 'Tr',
    accent: '#0EA5E9',
  },
  {
    id: 'tamagui',
    name: 'Tamagui',
    description:
      'Universal UI kit with style props and an optimizing compiler. Web + React Native, one codebase.',
    url: 'https://tamagui.dev',
    framework: ['React', 'Universal'],
    styling: 'CSS-in-JS',
    pricing: 'Free',
    initials: 'Tm',
    accent: '#FF3366',
  },
  {
    id: 'park-ui',
    name: 'Park UI',
    description:
      'Ready-to-use components built on Ark UI primitives and Panda CSS. Framework-agnostic.',
    url: 'https://park-ui.com',
    framework: ['React', 'Vue', 'Solid'],
    styling: 'Mixed',
    pricing: 'Free',
    initials: 'Pk',
    accent: '#22C55E',
  },
  {
    id: 'magic-ui',
    name: 'Magic UI',
    description:
      '50+ free animated components built with React, Tailwind and Framer Motion.',
    url: 'https://magicui.design',
    framework: ['React'],
    styling: 'Tailwind',
    pricing: 'Free',
    highlight: 'Animated',
    initials: 'Mg',
    accent: '#A855F7',
  },
  {
    id: 'aceternity',
    name: 'Aceternity UI',
    description:
      'Striking animated Tailwind components — landing-page primitives, hero variants, motion.',
    url: 'https://ui.aceternity.com',
    framework: ['React'],
    styling: 'Tailwind',
    pricing: 'Free + Pro',
    highlight: 'Animated',
    initials: 'Ac',
    accent: '#0EA5E9',
  },
  {
    id: 'origin-ui',
    name: 'Origin UI',
    description:
      'Polished extensions to shadcn/ui. Drop-in primitives with refined motion and edge cases.',
    url: 'https://originui.com',
    framework: ['React'],
    styling: 'Tailwind',
    pricing: 'Free',
    initials: 'Or',
    accent: '#F97316',
  },
  {
    id: 'tailwind-ui',
    name: 'Tailwind UI',
    description:
      'Hand-crafted marketing pages, application UI and ecommerce templates by Tailwind Labs.',
    url: 'https://tailwindui.com',
    framework: ['React', 'Vue'],
    styling: 'Tailwind',
    pricing: 'Paid',
    initials: 'Tw',
    accent: '#06B6D4',
  },
  {
    id: 'daisyui',
    name: 'DaisyUI',
    description:
      'Tailwind plugin that adds class-name component utilities like btn, card, modal.',
    url: 'https://daisyui.com',
    framework: ['Universal', 'CSS'],
    styling: 'Tailwind',
    pricing: 'Free',
    initials: 'Dy',
    accent: '#1AD1A5',
  },
  {
    id: 'flowbite',
    name: 'Flowbite',
    description:
      'Tailwind component library with React, Vue, Svelte and Angular bindings.',
    url: 'https://flowbite.com',
    framework: ['React', 'Vue', 'Svelte'],
    styling: 'Tailwind',
    pricing: 'Free + Pro',
    initials: 'Fl',
    accent: '#3F83F8',
  },
  {
    id: 'react-aria',
    name: 'React Aria',
    description:
      'Adobe’s library of accessible UI hooks — full control over rendering and styling.',
    url: 'https://react-spectrum.adobe.com/react-aria',
    framework: ['React'],
    styling: 'Unstyled',
    pricing: 'Free',
    initials: 'Aa',
    accent: '#E60012',
  },
  {
    id: 'ariakit',
    name: 'Ariakit',
    description:
      'Lower-level toolkit for building accessible web apps. Composable, unstyled primitives.',
    url: 'https://ariakit.org',
    framework: ['React'],
    styling: 'Unstyled',
    pricing: 'Free',
    initials: 'Ak',
    accent: '#7B61FF',
  },
  {
    id: 'primereact',
    name: 'PrimeReact',
    description:
      '90+ rich components covering inputs, data tables, charts and a deep theme designer.',
    url: 'https://primereact.org',
    framework: ['React'],
    styling: 'CSS',
    pricing: 'Free',
    initials: 'Pr',
    accent: '#42A5F5',
  },
  {
    id: 'geist-ui',
    name: 'Geist UI',
    description:
      'Vercel’s open Geist design system — minimal, monochrome React components.',
    url: 'https://geist-ui.dev',
    framework: ['React'],
    styling: 'CSS-in-JS',
    pricing: 'Free',
    initials: 'Ge',
    accent: '#000000',
  },
  {
    id: 'arco',
    name: 'Arco Design',
    description:
      'ByteDance’s enterprise UI library with rich data primitives and an admin theme.',
    url: 'https://arco.design',
    framework: ['React', 'Vue'],
    styling: 'CSS-in-JS',
    pricing: 'Free',
    initials: 'Ar',
    accent: '#165DFF',
  },
  {
    id: 'semi',
    name: 'Semi Design',
    description:
      'Tencent + ByteDance design system — clean, modern, tightly themed React components.',
    url: 'https://semi.design',
    framework: ['React'],
    styling: 'CSS-in-JS',
    pricing: 'Free',
    initials: 'Se',
    accent: '#0064FA',
  },
  {
    id: 'shadcn-vue',
    name: 'shadcn-vue',
    description:
      'Community port of shadcn/ui to Vue — same primitives, same Tailwind, copy-paste model.',
    url: 'https://www.shadcn-vue.com',
    framework: ['Vue'],
    styling: 'Tailwind',
    pricing: 'Free',
    initials: 'sv',
    accent: '#42B883',
  },
  {
    id: 'preline',
    name: 'Preline UI',
    description:
      'Open-source Tailwind component library with 1,000+ examples and admin templates.',
    url: 'https://preline.co',
    framework: ['Universal'],
    styling: 'Tailwind',
    pricing: 'Free + Pro',
    initials: 'Pl',
    accent: '#3B82F6',
  },
];
