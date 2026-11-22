export interface ParsedUpiQr {
  pa: string; // payee UPI ID
  pn?: string; // payee name embedded in the QR (set by whoever made the QR, so it is a claim, not proof)
  am?: string; // amount
  tn?: string; // note
}

/** Parses the text inside a UPI QR code, e.g. upi://pay?pa=name@bank&pn=Name&am=500&cu=INR */
export function parseUpiUri(raw: string): ParsedUpiQr | null {
  const text = raw.trim();
  if (!/^upi:\/\/pay\?/i.test(text)) return null;
  const params = new URLSearchParams(text.slice(text.indexOf('?') + 1));
  const pa = params.get('pa')?.trim();
  if (!pa || !/^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}$/.test(pa)) return null;
  return {
    pa,
    pn: params.get('pn')?.trim() || undefined,
    am: params.get('am')?.trim() || undefined,
    tn: params.get('tn')?.trim() || undefined,
  };
}
