/* ===========================================================
   Atlas — gradient presets.

   Source seeds:
     - Ghosh/uiGradients gradients.json — main branch as of
       2026-04. https://github.com/Ghosh/uiGradients
     - Trending Tailwind / Vercel / Linear-flavoured
       contemporary gradients (hand-curated).

   Each preset has a deterministic id + a CSS string that
   GradientGenerator can consume directly.
   =========================================================== */

export interface GradientPreset {
  id: string;
  name: string;
  /** Hex of the first stop — used for sorting + UI accents. */
  from: string;
  /** Hex of the last stop. */
  to: string;
  /** Direction in degrees (0 = bottom→top, 90 = left→right). */
  angle: number;
  /** Pre-built CSS background expression. */
  css: string;
  /** Tag bucket for filtering. */
  bucket: 'Sunset' | 'Ocean' | 'Forest' | 'Pastel' | 'Vivid' | 'Mono' | 'Mesh' | 'Neon';
}

const make = (
  id: string,
  name: string,
  from: string,
  to: string,
  angle: number,
  bucket: GradientPreset['bucket']
): GradientPreset => ({
  id,
  name,
  from,
  to,
  angle,
  bucket,
  css: `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`,
});

export const gradients: GradientPreset[] = [
  // ── Sunset ──────────────────────────────────────────────────
  make('sunset-omolon', 'Omolon', '#091E3A', '#2F80ED', 135, 'Ocean'),
  make('sunset-amin', 'Amin', '#8E2DE2', '#4A00E0', 135, 'Vivid'),
  make('sunset-orange-juice', 'Orange Juice', '#FF8008', '#FFC837', 90, 'Sunset'),
  make('sunset-yoda', 'Yoda', '#FF0099', '#493240', 135, 'Vivid'),
  make('sunset-tikal', 'Tikal', '#9c27b0', '#3f51b5', 135, 'Vivid'),
  make('sunset-shifter', 'Shifter', '#bc4e9c', '#f80759', 135, 'Vivid'),
  make('sunset-pacific-dream', 'Pacific Dream', '#34e89e', '#0f3443', 135, 'Forest'),
  make('sunset-purplepine', 'Purplepine', '#20002c', '#cbb4d4', 135, 'Vivid'),
  make('sunset-sherbert', 'Sherbert', '#f79d00', '#64f38c', 135, 'Sunset'),
  make('sunset-firewatch', 'Firewatch', '#cb2d3e', '#ef473a', 135, 'Sunset'),
  make('sunset-kashmir', 'Kashmir', '#614385', '#516395', 135, 'Mono'),
  make('sunset-electric-violet', 'Electric Violet', '#4776e6', '#8e54e9', 135, 'Vivid'),
  make('sunset-venice-blue', 'Venice Blue', '#085078', '#85d8ce', 135, 'Ocean'),
  make('sunset-bourbon', 'Bourbon', '#ec6f66', '#f3a183', 135, 'Sunset'),
  make('sunset-calm-darya', 'Calm Darya', '#5f2c82', '#49a09d', 135, 'Mesh'),

  // ── Ocean ───────────────────────────────────────────────────
  make('ocean-aqua', 'Aqua Marine', '#1a2980', '#26d0ce', 135, 'Ocean'),
  make('ocean-blue-skies', 'Blue Skies', '#56ccf2', '#2f80ed', 135, 'Ocean'),
  make('ocean-jaipur', 'Jaipur', '#dd5e89', '#f7bb97', 135, 'Sunset'),
  make('ocean-sea-blizz', 'Sea Blizz', '#1cd8d2', '#93edc7', 135, 'Ocean'),
  make('ocean-deep-space', 'Deep Space', '#000000', '#434343', 135, 'Mono'),
  make('ocean-decent', 'Decent', '#4ca1af', '#c4e0e5', 135, 'Ocean'),
  make('ocean-roseanna', 'Roseanna', '#ffafbd', '#ffc3a0', 135, 'Pastel'),
  make('ocean-shore', 'Shore', '#70e1f5', '#ffd194', 135, 'Pastel'),
  make('ocean-haikus', 'Haikus', '#fd746c', '#ff9068', 135, 'Sunset'),
  make('ocean-shrimpy', 'Shrimpy', '#e74c3c', '#3498db', 135, 'Vivid'),
  make('ocean-dany', 'Dany', '#f953c6', '#b91d73', 135, 'Vivid'),
  make('ocean-frozen', 'Frozen', '#403B4A', '#E7E9BB', 135, 'Mono'),
  make('ocean-arielle-smile', 'Arielle’s Smile', '#3494E6', '#EC6EAD', 135, 'Vivid'),

  // ── Forest ──────────────────────────────────────────────────
  make('forest-mello', 'Mello', '#c0392b', '#8e44ad', 135, 'Vivid'),
  make('forest-grade-grey', 'Grade Grey', '#bdc3c7', '#2c3e50', 135, 'Mono'),
  make('forest-evening-night', 'Evening Night', '#005AA7', '#FFFDE4', 135, 'Ocean'),
  make('forest-mojito', 'Mojito', '#1d976c', '#93f9b9', 135, 'Forest'),
  make('forest-ed-sunset', 'Ed’s Sunset', '#ff7e5f', '#feb47b', 135, 'Sunset'),
  make('forest-vine', 'Vine', '#00bf8f', '#001510', 135, 'Forest'),
  make('forest-summer', 'Summer', '#22c1c3', '#fdbb2d', 135, 'Forest'),
  make('forest-koko-caramel', 'Koko Caramel', '#D1913C', '#FFD194', 135, 'Sunset'),
  make('forest-fresh-papaya', 'Fresh Papaya', '#fbab66', '#f7418c', 135, 'Sunset'),
  make('forest-king-yna', 'King Yna', '#1a2a6c', '#b21f1f', 135, 'Vivid'),

  // ── Pastel ──────────────────────────────────────────────────
  make('pastel-sublime-light', 'Sublime Light', '#fc5c7d', '#6a82fb', 135, 'Pastel'),
  make('pastel-bighead', 'Bighead', '#c94b4b', '#4b134f', 135, 'Vivid'),
  make('pastel-clouds', 'Clouds', '#ECE9E6', '#FFFFFF', 135, 'Pastel'),
  make('pastel-piggy-pink', 'Piggy Pink', '#ee9ca7', '#ffdde1', 135, 'Pastel'),
  make('pastel-cool-blues', 'Cool Blues', '#2193b0', '#6dd5ed', 135, 'Ocean'),
  make('pastel-mauve', 'Mauve', '#42275a', '#734b6d', 135, 'Mono'),
  make('pastel-lawrencium', 'Lawrencium', '#0F0C29', '#302B63', 135, 'Mono'),
  make('pastel-witching-hour', 'Witching Hour', '#c31432', '#240b36', 135, 'Vivid'),
  make('pastel-virgin', 'Virgin', '#C9FFBF', '#FFAFBD', 135, 'Pastel'),
  make('pastel-relay', 'Relay', '#3A1C71', '#D76D77', 135, 'Vivid'),
  make('pastel-alive', 'Alive', '#CB356B', '#BD3F32', 135, 'Sunset'),
  make('pastel-scooter', 'Scooter', '#36D1DC', '#5B86E5', 135, 'Ocean'),

  // ── Vivid ───────────────────────────────────────────────────
  make('vivid-purple-bliss', 'Purple Bliss', '#360033', '#0b8793', 135, 'Vivid'),
  make('vivid-azur-lane', 'Azur Lane', '#7F7FD5', '#86A8E7', 135, 'Vivid'),
  make('vivid-mantle', 'Mantle', '#24C6DC', '#514A9D', 135, 'Vivid'),
  make('vivid-poncho', 'Poncho', '#403A3E', '#BE5869', 135, 'Mono'),
  make('vivid-pure-lust', 'Pure Lust', '#333333', '#dd1818', 135, 'Vivid'),
  make('vivid-dawn', 'Dawn', '#F3904F', '#3B4371', 135, 'Sunset'),
  make('vivid-shadow-night', 'Shadow Night', '#000000', '#434343', 135, 'Mono'),
  make('vivid-moonrise', 'Moonrise', '#dae2f8', '#d6a4a4', 135, 'Pastel'),
  make('vivid-electric', 'Electric', '#136a8a', '#267871', 135, 'Ocean'),
  make('vivid-velvet-sun', 'Velvet Sun', '#e1eec3', '#f05053', 135, 'Sunset'),
  make('vivid-radar', 'Radar', '#A770EF', '#CF8BF3', 135, 'Vivid'),

  // ── Mono ────────────────────────────────────────────────────
  make('mono-portrait', 'Portrait', '#8e9eab', '#eef2f3', 135, 'Mono'),
  make('mono-flickr', 'Flickr', '#ff0084', '#33001b', 135, 'Vivid'),
  make('mono-disco', 'Disco', '#4ECDC4', '#556270', 135, 'Mono'),
  make('mono-stellar', 'Stellar', '#7474BF', '#348AC7', 135, 'Vivid'),
  make('mono-bossanova', 'Bossanova', '#FF512F', '#DD2476', 135, 'Sunset'),
  make('mono-ali', 'Ali', '#ff4b1f', '#1fddff', 135, 'Vivid'),
  make('mono-alihossein', 'Alihossein', '#f7ff00', '#db36a4', 135, 'Vivid'),
  make('mono-sin-city-red', 'Sin City Red', '#ED213A', '#93291E', 135, 'Sunset'),
  make('mono-blu', 'Blu', '#00416A', '#E4E5E6', 135, 'Ocean'),
  make('mono-purplin', 'Purplin', '#6a3093', '#a044ff', 135, 'Vivid'),

  // ── Mesh-ish (radial-style) ─────────────────────────────────
  make('mesh-passion', 'Passion', '#e53935', '#e35d5b', 135, 'Mesh'),
  make('mesh-clear-sky', 'Clear Sky', '#005C97', '#363795', 135, 'Mesh'),
  make('mesh-rainbow-blue', 'Rainbow Blue', '#00F260', '#0575E6', 135, 'Mesh'),
  make('mesh-lush', 'Lush', '#56ab2f', '#a8e063', 135, 'Mesh'),
  make('mesh-celestial', 'Celestial', '#C33764', '#1D2671', 135, 'Mesh'),
  make('mesh-margo', 'Margo', '#ffefba', '#ffffff', 135, 'Mesh'),
  make('mesh-blue-raspberry', 'Blue Raspberry', '#00B4DB', '#0083B0', 135, 'Mesh'),
  make('mesh-jshine', 'JShine', '#12c2e9', '#f64f59', 135, 'Mesh'),

  // ── Neon ────────────────────────────────────────────────────
  make('neon-aqua-splash', 'Aqua Splash', '#13547a', '#80d0c7', 135, 'Neon'),
  make('neon-juicy-peach', 'Juicy Peach', '#ffecd2', '#fcb69f', 135, 'Neon'),
  make('neon-young-passion', 'Young Passion', '#ff8177', '#cf556c', 135, 'Neon'),
  make('neon-lady-lips', 'Lady Lips', '#ff9a9e', '#fecfef', 135, 'Neon'),
  make('neon-sunny-morning', 'Sunny Morning', '#f6d365', '#fda085', 135, 'Neon'),
  make('neon-rainy-ashville', 'Rainy Ashville', '#fbc2eb', '#a6c1ee', 135, 'Neon'),
  make('neon-frozen-dreams', 'Frozen Dreams', '#fdcbf1', '#e6dee9', 135, 'Neon'),
  make('neon-winter-neva', 'Winter Neva', '#a1c4fd', '#c2e9fb', 135, 'Neon'),
  make('neon-dusty-grass', 'Dusty Grass', '#d4fc79', '#96e6a1', 135, 'Neon'),
  make('neon-tempting-azure', 'Tempting Azure', '#84fab0', '#8fd3f4', 135, 'Neon'),
  make('neon-heavy-rain', 'Heavy Rain', '#cfd9df', '#e2ebf0', 135, 'Neon'),
];

export const gradientBuckets: GradientPreset['bucket'][] = [
  'Sunset',
  'Ocean',
  'Forest',
  'Pastel',
  'Vivid',
  'Mono',
  'Mesh',
  'Neon',
];
