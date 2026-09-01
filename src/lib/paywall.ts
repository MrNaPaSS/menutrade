/**
 * Сигнал боту о том, что пользователь упёрся в ограничение.
 *
 * На этом строится цепочка дожима "пейволл": бот знает, что человек
 * был внутри и хотел большего, и пишет ему точечно, а не вслепую.
 */

export function getBotApiBase(): string {
  return import.meta.env.DEV
    ? '/bot-api'
    : (import.meta.env.VITE_BOT_API_URL || 'http://localhost:8081');
}

/** Fire-and-forget: аналитика не должна ломать экран. */
export function reportPaywallHit(userId: string | null, feature: string): void {
  if (!userId) return;
  fetch(`${getBotApiBase()}/hit-paywall`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ userId, feature }),
  }).catch(() => { /* не критично */ });
}
