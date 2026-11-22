// Domain helpers for the link check: official-domain matching and lookalike (typosquat) detection.

export const OFFICIAL_DOMAINS = [
  'sebi.gov.in', 'zerodha.com', 'groww.in', 'upstox.com', 'angelone.in',
  'icicidirect.com', 'hdfcsec.com', 'kotaksecurities.com', 'kotak.com',
  'nseindia.com', 'bseindia.com', 'nsdl.co.in', 'cdslindia.com',
  'sharekhan.com', 'motilaloswal.com', 'fyers.in', 'paytm.com', 'phonepe.com',
  'rbi.org.in', 'npci.org.in', 'cybercrime.gov.in',
];

// Distinctive brand tokens only. Short or common words ("dhan", "grow") are left out
// on purpose because they would flag unrelated sites.
export const BRAND_TOKENS = [
  'zerodha', 'groww', 'upstox', 'angelone', 'icicidirect', 'hdfcsec', 'kotak',
  'motilal', 'sharekhan', 'nseindia', 'bseindia', 'sebi', 'paytm', 'phonepe', 'fyers',
];

const SUSPICIOUS_TLDS = new Set([
  'top', 'xyz', 'icu', 'vip', 'site', 'online', 'click', 'live', 'club', 'buzz', 'cfd', 'sbs', 'shop', 'work',
]);

export function stripWww(host: string): string {
  return host.replace(/^www\./i, '').toLowerCase();
}

/** True for the exact official domain or a real subdomain (kite.zerodha.com), never evil-zerodha.com. */
export function isOfficialHost(host: string): boolean {
  const h = stripWww(host);
  return OFFICIAL_DOMAINS.some((d) => h === d || h.endsWith(`.${d}`));
}

export function hasSuspiciousTld(host: string): boolean {
  const tld = stripWww(host).split('.').pop() ?? '';
  return SUSPICIOUS_TLDS.has(tld);
}

const LEET: Record<string, string> = { '0': 'o', '3': 'e', '4': 'a', '5': 's', '7': 't', '$': 's', '@': 'a' };

/** The digit 1 can stand for l or i, so try both readings. */
function leetVariants(token: string): string[] {
  const base = token.split('').map((ch) => LEET[ch] ?? ch).join('');
  return Array.from(new Set([base.replace(/1/g, 'l'), base.replace(/1/g, 'i')]));
}

export function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

export interface LookalikeHit {
  brand: string;
  token: string;
  kind: 'brand_inside' | 'leet' | 'near_miss';
}

/** Returns a hit when an unofficial host imitates a known brand. Official hosts always return null. */
export function detectLookalike(host: string): LookalikeHit | null {
  const h = stripWww(host);
  if (isOfficialHost(h)) return null;

  const body = h.split('.').slice(0, -1); // drop the TLD
  const candidates = new Set<string>();
  for (const label of body) {
    candidates.add(label);
    candidates.add(label.replace(/-/g, ''));
    label.split('-').forEach((part) => part && candidates.add(part));
  }

  for (const token of candidates) {
    for (const brand of BRAND_TOKENS) {
      if (token.includes(brand)) return { brand, token, kind: 'brand_inside' };
    }
    for (const variant of leetVariants(token)) {
      for (const brand of BRAND_TOKENS) {
        if (variant !== token && variant.includes(brand)) return { brand, token, kind: 'leet' };
        if (brand.length >= 6 && variant.length >= 5 && variant !== brand) {
          if (levenshtein(variant, brand) <= 1) return { brand, token, kind: 'near_miss' };
        }
      }
    }
  }
  return null;
}