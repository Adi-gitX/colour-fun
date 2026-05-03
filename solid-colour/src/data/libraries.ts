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
  /** npm package name — used for install snippets on detail pages. */
  npmPackage?: string;
  /** GitHub `owner/repo` — used for stars/last-commit live data later. */
  github?: string;
  /** First-class TypeScript support (types shipped, not @types/x). */
  typescript?: boolean;
  /** Curated, opinionated pros — kept short. */
  pros?: string[];
  /** Curated, opinionated cons — kept short. */
  cons?: string[];
  /** Other library ids worth comparing against. */
  alternatives?: string[];
  /** Long-form pitch shown on the detail page hero. */
  tagline?: string;
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
    npmPackage: 'shadcn',
    github: 'shadcn-ui/ui',
    typescript: true,
    tagline:
      'Not a component library. A collection of re-usable components you copy into your codebase and own.',
    pros: [
      'You own the code — patch, restyle, fork without forking',
      'Zero runtime cost — no library bundle to ship',
      'Best-in-class a11y by piggybacking on Radix primitives',
    ],
    cons: [
      'No automatic upgrade path — components are copies',
      'Tailwind dependency is non-negotiable',
    ],
    alternatives: ['radix-ui', 'headlessui'],
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
    npmPackage: '@radix-ui/react-dialog',
    github: 'radix-ui/primitives',
    typescript: true,
    tagline:
      'Low-level primitives — Dialog, Dropdown, Popover, Slider — that handle keyboard, focus and a11y so you can ship the design.',
    pros: [
      'Best-in-class accessibility — keyboard, ARIA, focus management out of the box',
      'Composable primitives — bring your own styling, no opinions',
      'Tiny bundle per primitive (tree-shakeable)',
    ],
    cons: [
      'You write all the styles',
      'No high-level patterns (Form, DataTable) — primitives only',
    ],
    alternatives: ['headlessui', 'shadcn-ui'],
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
    npmPackage: '@headlessui/react',
    github: 'tailwindlabs/headlessui',
    typescript: true,
    tagline:
      'Unstyled UI primitives from the Tailwind Labs team — Menu, Dialog, Listbox, Combobox, Tabs.',
    pros: [
      'Maintained by Tailwind Labs — pairs perfectly with Tailwind',
      'Solid a11y — focus management, ARIA, keyboard',
      'Vue support out of the box (rare among React-first libraries)',
    ],
    cons: ['Smaller primitive set than Radix', 'Slower release cadence'],
    alternatives: ['radix-ui', 'shadcn-ui'],
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
    npmPackage: '@mantine/core',
    github: 'mantinedev/mantine',
    typescript: true,
    tagline:
      '120+ polished components and 70+ hooks. Batteries-included for product teams who want to ship without designing every primitive.',
    pros: [
      'Massive surface area — DataTable, Calendar, RichText, Notifications, all in one',
      'Excellent dark-mode story',
      '70+ hooks ship alongside the components',
    ],
    cons: [
      'Larger bundle than primitive-only libraries',
      'Opinionated styling can be hard to override',
    ],
    alternatives: ['mui', 'antd', 'chakra-ui'],
  },
  {
    id: 'chakra-ui',
    name: 'Chakra UI',
    description: 'Simple, modular and accessible component library for React applications.',
    url: 'https://chakra-ui.com',
    framework: ['React'],
    styling: 'CSS-in-JS',
    pricing: 'Free',
    initials: 'Ch',
    accent: '#319795',
    npmPackage: '@chakra-ui/react',
    github: 'chakra-ui/chakra-ui',
    typescript: true,
    tagline:
      'Style-props-first React UI library. Build interfaces with primitives like <Box> and <Stack>.',
    pros: [
      'Style props are wonderfully ergonomic for layout',
      'Strong focus on a11y',
      'Active community + plugin ecosystem',
    ],
    cons: ['CSS-in-JS runtime cost', 'V3 rewrite changed the API significantly'],
    alternatives: ['mantine', 'mui'],
  },
  {
    id: 'mui',
    name: 'Material UI',
    description: 'Comprehensive React UI library implementing Google Material Design with theming.',
    url: 'https://mui.com',
    framework: ['React'],
    styling: 'CSS-in-JS',
    pricing: 'Free + Pro',
    initials: 'MU',
    accent: '#007FFF',
    npmPackage: '@mui/material',
    github: 'mui/material-ui',
    typescript: true,
    tagline:
      'The most-downloaded React component library. Material Design 3 implementation with paid X (DataGrid, Charts) tier.',
    pros: [
      'Enormous component surface and ecosystem',
      'MUI X DataGrid is genuinely excellent',
      'Mature theming and i18n',
    ],
    cons: [
      'Material Design aesthetic is opinionated — hard to escape',
      'Large bundle if you import default everything',
      'Pro tier required for advanced data components',
    ],
    alternatives: ['mantine', 'antd', 'chakra-ui'],
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
    description: '50+ free animated components built with React, Tailwind and Framer Motion.',
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
    description: 'Tailwind plugin that adds class-name component utilities like btn, card, modal.',
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
    description: 'Tailwind component library with React, Vue, Svelte and Angular bindings.',
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
    description: 'Vercel’s open Geist design system — minimal, monochrome React components.',
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
    description: 'ByteDance’s enterprise UI library with rich data primitives and an admin theme.',
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
    description: 'Open-source Tailwind component library with 1,000+ examples and admin templates.',
    url: 'https://preline.co',
    framework: ['Universal'],
    styling: 'Tailwind',
    pricing: 'Free + Pro',
    initials: 'Pl',
    accent: '#3B82F6',
  },
];
