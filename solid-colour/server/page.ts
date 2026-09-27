/**
 * Live page checks. Every site Garden recommends is fetched at answer time: it has to load, and
 * its title, description and social image become the card.
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

export interface PageInfo {
  ok: boolean;
  status: number;
  /** Where the request ended up after redirects. */
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  /** Same-site links on the page, for finding the section that matches a request. */
  links: Array<{ href: string; text: string }>;
}

const TTL_OK = 30 * 60_000;
const TTL_FAIL = 60_000;
const cache = new Map<string, { exp: number; value: Promise<PageInfo> }>();

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

/** Reads one <meta> value whatever order its attributes are written in. */
function meta(html: string, names: string[]): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    if (!key || !names.includes(key)) continue;
    const content = /content\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1];
    if (content) return decode(content);
  }
  return null;
}

function sameSiteLinks(html: string, base: string): PageInfo['links'] {
  const host = new URL(base).hostname;
  const out: PageInfo['links'] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let href: URL;
    try {
      href = new URL(m[1], base);
    } catch {
      continue;
    }
    if (href.hostname !== host || !/^https?:$/.test(href.protocol)) continue;
    const key = href.origin + href.pathname;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ href: key, text: decode(m[2].replace(/<[^>]+>/g, ' ')).slice(0, 80) });
    if (out.length >= 600) break;
  }
  return out;
}

async function load(url: string): Promise<PageInfo> {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: AbortSignal.timeout(12_000),
    });
    const finalUrl = res.url || url;
    // Bot walls (Cloudflare, Vercel checkpoints) answer 403/429/503 to scripts but load fine in
    // a browser; the site is alive, we just cannot read its head.
    if (!res.ok) {
      const walled = [401, 403, 429, 503].includes(res.status);
      return { ok: walled, status: res.status, url: finalUrl, title: null, description: null, image: null, links: [] };
    }
    const html = (await res.text()).slice(0, 300_000);
    const title = meta(html, ['og:title', 'twitter:title']) ?? decode(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ?? '') ?? null;
    const image = meta(html, ['og:image', 'og:image:url', 'twitter:image', 'twitter:image:src']);
    return {
      ok: true,
      status: res.status,
      url: finalUrl,
      title: title || null,
      description: meta(html, ['og:description', 'description', 'twitter:description']),
      image: image ? new URL(image, finalUrl).toString() : null,
      links: sameSiteLinks(html, finalUrl),
    };
  } catch {
    return { ok: false, status: 0, url, title: null, description: null, image: null, links: [] };
  }
}

export function fetchPage(url: string): Promise<PageInfo> {
  const hit = cache.get(url);
  if (hit && hit.exp > Date.now()) return hit.value;
  const value = load(url);
  const entry = { exp: Date.now() + TTL_OK, value };
  cache.set(url, entry);
  void value.then((v) => {
    if (!v.ok) entry.exp = Date.now() + TTL_FAIL;
  });
  return value;
}

/** Grounding sources arrive as Google redirect links; follow one hop to the real page. */
export async function resolveRedirect(uri: string): Promise<string> {
  if (!/vertexaisearch\.cloud\.google\.com\/grounding-api-redirect/.test(uri)) return uri;
  try {
    const res = await fetch(uri, { redirect: 'manual', signal: AbortSignal.timeout(6_000) });
    return res.headers.get('location') ?? uri;
  } catch {
    return uri;
  }
}

export const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};
