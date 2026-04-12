export interface DesignSystem {
  id: string;
  name: string;
  org: string;
  description: string;
  url: string;
  highlight?: string;
  initials: string;
  accent: string;
}

export const designSystems: DesignSystem[] = [
  {
    id: 'material',
    name: 'Material Design',
    org: 'Google',
    description:
      'Google’s flagship system — components, motion, accessibility and theming guidance.',
    url: 'https://m3.material.io',
    initials: 'Ma',
    accent: '#4285F4',
  },
  {
    id: 'apple-hig',
    name: 'Human Interface Guidelines',
    org: 'Apple',
    description:
      'Apple’s platform guidelines for iOS, macOS, visionOS — patterns, controls, hierarchy.',
    url: 'https://developer.apple.com/design/human-interface-guidelines',
    initials: 'Ap',
    accent: '#000000',
  },
  {
    id: 'polaris',
    name: 'Polaris',
    org: 'Shopify',
    description:
      'Shopify’s admin design system. Strong content guidance, polished React components.',
    url: 'https://polaris.shopify.com',
    initials: 'Po',
    accent: '#008060',
  },
  {
    id: 'carbon',
    name: 'Carbon',
    org: 'IBM',
    description:
      'IBM’s open-source system. Disciplined grid, accessible, deeply documented patterns.',
    url: 'https://carbondesignsystem.com',
    initials: 'Cb',
    accent: '#0F62FE',
  },
  {
    id: 'lightning',
    name: 'Lightning Design System',
    org: 'Salesforce',
    description:
      'Salesforce’s system for enterprise apps. Dense data UI, settled patterns, full SLDS tokens.',
    url: 'https://www.lightningdesignsystem.com',
    initials: 'Lg',
    accent: '#0070D2',
  },
  {
    id: 'primer',
    name: 'Primer',
    org: 'GitHub',
    description:
      'GitHub’s design system — code-forward components with Octicons and dual-theme tokens.',
    url: 'https://primer.style',
    initials: 'Pm',
    accent: '#0969DA',
  },
  {
    id: 'atlassian',
    name: 'Atlassian Design',
    org: 'Atlassian',
    description:
      'Atlassian’s system across Jira, Confluence — patterns for collaborative product UIs.',
    url: 'https://atlassian.design',
    initials: 'At',
    accent: '#0052CC',
  },
  {
    id: 'fluent',
    name: 'Fluent',
    org: 'Microsoft',
    description: 'Microsoft’s cross-platform system — Web, Windows, Office. Rich token model.',
    url: 'https://fluent2.microsoft.design',
    initials: 'Fu',
    accent: '#0078D4',
  },
  {
    id: 'cloudscape',
    name: 'Cloudscape',
    org: 'Amazon',
    description:
      'AWS’s open-source design system for service consoles — dense forms, tables, dashboards.',
    url: 'https://cloudscape.design',
    initials: 'Cl',
    accent: '#FF9900',
  },
  {
    id: 'spectrum',
    name: 'Spectrum',
    org: 'Adobe',
    description:
      'Adobe’s system — rigorous tokens, accessibility-first, paired with React Spectrum.',
    url: 'https://spectrum.adobe.com',
    initials: 'Sp',
    accent: '#FA0F00',
  },
  {
    id: 'garden',
    name: 'Garden',
    org: 'Zendesk',
    description: 'Zendesk’s React design system — calm, content-first, accessible patterns.',
    url: 'https://garden.zendesk.com',
    initials: 'Gd',
    accent: '#03363D',
  },
  {
    id: 'geist',
    name: 'Geist',
    org: 'Vercel',
    description:
      'Vercel’s minimalist system. Used in dashboard, docs, examples — strong typography.',
    url: 'https://vercel.com/geist',
    initials: 'Vg',
    accent: '#000000',
  },
  {
    id: 'canvas',
    name: 'Workday Canvas',
    org: 'Workday',
    description: 'Workday’s enterprise system — careful information density, rich form patterns.',
    url: 'https://canvas.workday.com',
    initials: 'Wc',
    accent: '#0875E1',
  },
  {
    id: 'gel',
    name: 'GEL',
    org: 'BBC',
    description:
      'BBC’s Global Experience Language — accessibility-first patterns across all BBC products.',
    url: 'https://www.bbc.co.uk/gel',
    initials: 'BB',
    accent: '#BB1919',
  },
];
