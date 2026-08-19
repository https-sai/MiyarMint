export type LocalPreferences = {
  tradeConfirmations: boolean
  alerts: boolean
}

const defaults: LocalPreferences = {
  tradeConfirmations: true,
  alerts: false,
}

const keyFor = (userId: string) => `myrmint:prefs:${userId}`

export function readPreferences(userId: string): LocalPreferences {
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<LocalPreferences>
    return {
      tradeConfirmations: parsed.tradeConfirmations ?? defaults.tradeConfirmations,
      alerts: parsed.alerts ?? defaults.alerts,
    }
  } catch {
    return defaults
  }
}

export function writePreferences(userId: string, prefs: LocalPreferences) {
  localStorage.setItem(keyFor(userId), JSON.stringify(prefs))
}
