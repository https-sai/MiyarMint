import { PostHog } from "posthog-node";

const apiKey = process.env.POSTHOG_API_KEY;

export const posthog =
  apiKey && !apiKey.includes("567890")
    ? new PostHog(apiKey, { host: "https://us.i.posthog.com" })
    : null;

export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
) {
  if (!posthog) return;
  if (properties) {
    posthog.capture({ distinctId, event, properties });
    return;
  }
  posthog.capture({ distinctId, event });
}
