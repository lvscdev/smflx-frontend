/* eslint-disable @typescript-eslint/no-explicit-any */

export { toUserMessage } from "./userMessages";

/**
 * Backwards-compatible alias. Prefer `toUserMessage`.
 */
import { toUserMessage } from "./userMessages";

export function normalizeError(err: unknown, ctx?: Parameters<typeof toUserMessage>[1]) {
  return toUserMessage(err, ctx);
}
