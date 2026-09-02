/* ===========================================================
   Hash routing.

   The app has no router dependency: `Route` is the single
   source of truth for "where am I", and these two pure
   functions convert it to and from `location.hash`. Keeping
   them pure makes them directly testable and keeps
   `useHashRoute` a thin sync layer.

     #/                          landing
     #/components                grid  (?q= &category= &source=)
     #/components/{slug}         detail
     #/wallpapers/solid          wallpapers, Solid tab
     #/wallpapers/gradients      wallpapers, Gradients tab
     #/wallpapers/images         wallpapers, Images tab
     #/about                     about
   =========================================================== */

export const WALLPAPER_TABS = ['solid', 'gradients', 'images'] as const;
export type WallpaperTab = (typeof WALLPAPER_TABS)[number];

export type Route =
  | { name: 'home' }
  | { name: 'components'; q: string; category: string; source: string }
  | { name: 'component'; slug: string }
  | { name: 'wallpapers'; tab: WallpaperTab }
  | { name: 'about' };

export const HOME_ROUTE: Route = { name: 'home' };

export function componentsRoute(
  filters: Partial<{ q: string; category: string; source: string }> = {}
): Route {
  return {
    name: 'components',
    q: filters.q ?? '',
    category: filters.category ?? '',
    source: filters.source ?? '',
  };
}

function isWallpaperTab(value: string): value is WallpaperTab {
  return (WALLPAPER_TABS as readonly string[]).includes(value);
}

/** Parse `location.hash` into a `Route`, falling back to home for anything unknown. */
export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  const [pathPart, queryPart = ''] = raw.split('?');
  const segments = pathPart.split('/').filter(Boolean);

  if (segments.length === 0) return HOME_ROUTE;

  switch (segments[0]) {
    case 'components': {
      if (segments.length >= 2) {
        return { name: 'component', slug: decodeURIComponent(segments[1]) };
      }
      const params = new URLSearchParams(queryPart);
      return componentsRoute({
        q: params.get('q') ?? '',
        category: params.get('category') ?? '',
        source: params.get('source') ?? '',
      });
    }
    case 'wallpapers': {
      const tab = segments[1] ?? 'solid';
      return { name: 'wallpapers', tab: isWallpaperTab(tab) ? tab : 'solid' };
    }
    case 'about':
      return { name: 'about' };
    default:
      return HOME_ROUTE;
  }
}

/** Render a `Route` as a `location.hash` value, including the leading `#`. */
export function formatHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'components': {
      const params = new URLSearchParams();
      if (route.q) params.set('q', route.q);
      if (route.category) params.set('category', route.category);
      if (route.source) params.set('source', route.source);
      const query = params.toString();
      return query ? `#/components?${query}` : '#/components';
    }
    case 'component':
      return `#/components/${encodeURIComponent(route.slug)}`;
    case 'wallpapers':
      return `#/wallpapers/${route.tab}`;
    case 'about':
      return '#/about';
  }
}

/**
 * True when two routes address the same *place* — used to decide whether a
 * hash change should push a history entry or quietly replace the current one.
 * Filter tweaks replace; moving between pages pushes.
 */
export function isSamePlace(a: Route, b: Route): boolean {
  if (a.name !== b.name) return false;
  if (a.name === 'component' && b.name === 'component') return a.slug === b.slug;
  if (a.name === 'wallpapers' && b.name === 'wallpapers') return a.tab === b.tab;
  return true;
}
