export type Pass = { name: string; email: string; no: string; confirmed: boolean }
const KEY = 'refuge-series-15'

export function loadPass(): Pass | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Pass) : null
  } catch {
    return null
  }
}
export function savePass(p: Pass | null) {
  try {
    if (p) localStorage.setItem(KEY, JSON.stringify(p))
    else localStorage.removeItem(KEY)
  } catch {
    /* modo privado: o ingresso vive só nesta aba */
  }
  window.dispatchEvent(new CustomEvent('refuge:pass', { detail: p }))
}

