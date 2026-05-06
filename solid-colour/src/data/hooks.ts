/* ===========================================================
   Atlas — React hooks catalog.

   Source-of-truth seeds (manually curated from):
     - streamich/react-use README, commit on main as of
       2026-04 — https://github.com/streamich/react-use
     - juliencrn/usehooks-ts README, commit on main as of
       2026-04 — https://github.com/juliencrn/usehooks-ts
     - usehooks.com (Gabe Ragland)

   Each entry is a hook you would actually reach for in a
   modern React app. Drop anything that's purely educational
   (not battle-tested) or duplicates a stdlib hook.
   =========================================================== */

export type HookCategory =
  | 'State'
  | 'Effect'
  | 'DOM'
  | 'Sensor'
  | 'Network'
  | 'Animation'
  | 'Lifecycle'
  | 'Utility';

export interface HookEntry {
  id: string;
  name: string;
  category: HookCategory;
  /** One-line description of what the hook does. */
  description: string;
  /** Source library — used to attribute the hook. */
  source: 'react-use' | 'usehooks-ts' | 'usehooks.com' | 'TanStack' | 'Mantine';
  /** Primary URL — docs page or repo. */
  url: string;
  /** npm install snippet target. */
  npmPackage?: string;
}

export const hooks: HookEntry[] = [
  // ── State ────────────────────────────────────────────────────
  {
    id: 'useLocalStorage',
    name: 'useLocalStorage',
    category: 'State',
    description: 'Persistent state synchronised with localStorage.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-local-storage',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useSessionStorage',
    name: 'useSessionStorage',
    category: 'State',
    description: 'Like useLocalStorage but scoped to the session.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-session-storage',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useToggle',
    name: 'useToggle',
    category: 'State',
    description: 'Boolean state with a stable toggle setter — kills useState ceremony.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useToggle.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useCounter',
    name: 'useCounter',
    category: 'State',
    description: 'Numeric counter with increment / decrement / reset.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-counter',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useList',
    name: 'useList',
    category: 'State',
    description: 'Array helpers with stable identity — push/remove/sort/reset.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useList.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useMap',
    name: 'useMap',
    category: 'State',
    description: 'Map state with set/delete/reset and stable identity for re-renders.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useMap.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useSet',
    name: 'useSet',
    category: 'State',
    description: 'Set state with add/has/remove and stable identity.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useSet.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useUndo',
    name: 'useUndo',
    category: 'State',
    description: 'State with undo / redo support.',
    source: 'usehooks.com',
    url: 'https://usehooks.com/useundo',
  },
  {
    id: 'usePrevious',
    name: 'usePrevious',
    category: 'State',
    description: 'Captures the previous value of a state or prop.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-previous',
    npmPackage: 'usehooks-ts',
  },

  // ── Effect ───────────────────────────────────────────────────
  {
    id: 'useDebounce',
    name: 'useDebounce',
    category: 'Effect',
    description: 'Debounce a fast-changing value — search inputs love this.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-debounce',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useDebouncedCallback',
    name: 'useDebouncedCallback',
    category: 'Effect',
    description: 'Debounces a callback rather than the value — for handlers.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-debounced-callback',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useThrottle',
    name: 'useThrottle',
    category: 'Effect',
    description: 'Throttle a fast-changing value to a maximum update frequency.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useThrottle.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useTimeout',
    name: 'useTimeout',
    category: 'Effect',
    description: 'Effectful setTimeout that respects React render cycles.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-timeout',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useInterval',
    name: 'useInterval',
    category: 'Effect',
    description: 'Effectful setInterval that respects React render cycles.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-interval',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useUpdateEffect',
    name: 'useUpdateEffect',
    category: 'Effect',
    description: 'Like useEffect but skips the first render.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useUpdateEffect.md',
    npmPackage: 'react-use',
  },

  // ── DOM ──────────────────────────────────────────────────────
  {
    id: 'useClickOutside',
    name: 'useClickOutside',
    category: 'DOM',
    description: 'Run a handler when a click happens outside a referenced element.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-on-click-outside',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useEventListener',
    name: 'useEventListener',
    category: 'DOM',
    description: 'Type-safe event listener with automatic cleanup.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-event-listener',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useHover',
    name: 'useHover',
    category: 'DOM',
    description: 'Track whether the mouse is over an element.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-hover',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useIntersectionObserver',
    name: 'useIntersectionObserver',
    category: 'DOM',
    description: 'Track when an element scrolls into / out of view.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-intersection-observer',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useResizeObserver',
    name: 'useResizeObserver',
    category: 'DOM',
    description: 'Reactively track an element’s size with ResizeObserver.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-resize-observer',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useElementSize',
    name: 'useElementSize',
    category: 'DOM',
    description: 'Track an element’s width and height — ResizeObserver-backed.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-element-size',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useScrollLock',
    name: 'useScrollLock',
    category: 'DOM',
    description: 'Lock body scroll while a modal / drawer is open.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-scroll-lock',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useCopyToClipboard',
    name: 'useCopyToClipboard',
    category: 'DOM',
    description: 'Async copy-to-clipboard with success/error state.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-copy-to-clipboard',
    npmPackage: 'usehooks-ts',
  },

  // ── Sensor ──────────────────────────────────────────────────
  {
    id: 'useMediaQuery',
    name: 'useMediaQuery',
    category: 'Sensor',
    description: 'Reactively follow a CSS media-query breakpoint.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-media-query',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useDarkMode',
    name: 'useDarkMode',
    category: 'Sensor',
    description: 'Track + control prefers-color-scheme + localStorage override.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-dark-mode',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useReducedMotion',
    name: 'useReducedMotion',
    category: 'Sensor',
    description: 'Track the user’s prefers-reduced-motion preference.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use',
    npmPackage: 'react-use',
  },
  {
    id: 'useWindowSize',
    name: 'useWindowSize',
    category: 'Sensor',
    description: 'Reactively track window inner size.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-window-size',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useScreen',
    name: 'useScreen',
    category: 'Sensor',
    description: 'Reactive window.screen — orientation, pixel ratio, dimensions.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useScreen.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useBattery',
    name: 'useBattery',
    category: 'Sensor',
    description: 'Reactive battery state via the Battery Status API.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useBattery.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useGeolocation',
    name: 'useGeolocation',
    category: 'Sensor',
    description: 'Reactive Geolocation API with loading + error state.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useGeolocation.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useNetworkState',
    name: 'useNetworkState',
    category: 'Sensor',
    description: 'Reactive Network Information API — online, type, downlink.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useNetworkState.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useIsClient',
    name: 'useIsClient',
    category: 'Sensor',
    description: 'Returns true after hydration — useful for SSR-safe browser checks.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-is-client',
    npmPackage: 'usehooks-ts',
  },

  // ── Network ─────────────────────────────────────────────────
  {
    id: 'useFetch',
    name: 'useFetch',
    category: 'Network',
    description: 'Minimal fetch wrapper with loading/error/data state.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useFetch.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useQuery',
    name: 'useQuery',
    category: 'Network',
    description: 'Async server-state + cache + retries — TanStack Query.',
    source: 'TanStack',
    url: 'https://tanstack.com/query/latest/docs/framework/react/reference/useQuery',
    npmPackage: '@tanstack/react-query',
  },
  {
    id: 'useMutation',
    name: 'useMutation',
    category: 'Network',
    description: 'Mutation primitive with optimistic updates — TanStack Query.',
    source: 'TanStack',
    url: 'https://tanstack.com/query/latest/docs/framework/react/reference/useMutation',
    npmPackage: '@tanstack/react-query',
  },
  {
    id: 'useInfiniteQuery',
    name: 'useInfiniteQuery',
    category: 'Network',
    description: 'Cursor-based pagination with virtual list support — TanStack Query.',
    source: 'TanStack',
    url: 'https://tanstack.com/query/latest/docs/framework/react/reference/useInfiniteQuery',
    npmPackage: '@tanstack/react-query',
  },

  // ── Animation ───────────────────────────────────────────────
  {
    id: 'useAnimationFrame',
    name: 'useAnimationFrame',
    category: 'Animation',
    description: 'requestAnimationFrame loop scoped to the component lifecycle.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use',
    npmPackage: 'react-use',
  },
  {
    id: 'useSpring',
    name: 'useSpring',
    category: 'Animation',
    description: 'Spring-based animated values — Framer Motion.',
    source: 'Mantine',
    url: 'https://motion.dev/docs/use-spring',
  },
  {
    id: 'useReducedMotion-fm',
    name: 'useReducedMotion (Motion)',
    category: 'Animation',
    description: 'Framer-Motion’s prefers-reduced-motion-aware hook.',
    source: 'Mantine',
    url: 'https://motion.dev/docs/use-reduced-motion',
  },

  // ── Lifecycle ───────────────────────────────────────────────
  {
    id: 'useMount',
    name: 'useMount',
    category: 'Lifecycle',
    description: 'Run an effect once on mount — a clearer useEffect(_, []).',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useMount.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useUnmount',
    name: 'useUnmount',
    category: 'Lifecycle',
    description: 'Run an effect on unmount.',
    source: 'react-use',
    url: 'https://github.com/streamich/react-use/blob/master/docs/useUnmount.md',
    npmPackage: 'react-use',
  },
  {
    id: 'useIsomorphicLayoutEffect',
    name: 'useIsomorphicLayoutEffect',
    category: 'Lifecycle',
    description: 'useLayoutEffect on the client, useEffect on the server. SSR-safe.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-isomorphic-layout-effect',
    npmPackage: 'usehooks-ts',
  },

  // ── Utility ─────────────────────────────────────────────────
  {
    id: 'useEventCallback',
    name: 'useEventCallback',
    category: 'Utility',
    description: 'Stable callback identity that always sees the latest props/state.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-event-callback',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useId',
    name: 'useId',
    category: 'Utility',
    description: 'React-stdlib hook that generates a stable, SSR-safe unique id.',
    source: 'usehooks-ts',
    url: 'https://react.dev/reference/react/useId',
  },
  {
    id: 'useStep',
    name: 'useStep',
    category: 'Utility',
    description: 'Stepper helper for multi-step forms / wizards.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-step',
    npmPackage: 'usehooks-ts',
  },
  {
    id: 'useCountdown',
    name: 'useCountdown',
    category: 'Utility',
    description: 'Countdown timer — start/pause/reset, exposes remaining time.',
    source: 'usehooks-ts',
    url: 'https://usehooks-ts.com/react-hook/use-countdown',
    npmPackage: 'usehooks-ts',
  },
];
