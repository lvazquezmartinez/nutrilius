// Helpers para mapear entre camelCase (front) y snake_case (API Django).

export function applyMap(obj: Record<string, any>, map: Record<string, string>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [from, to] of Object.entries(map)) {
    if (obj[from] !== undefined) out[to] = obj[from]
  }
  return out
}

export function invert(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(map)) out[v] = k
  return out
}
