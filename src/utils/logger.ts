// src/utils/logger.ts
export function logUserAction(action: string, detail?: any) {
  if (detail !== undefined) {
    console.debug(`[USER_ACTION] ${action}`, detail);
  } else {
    console.debug(`[USER_ACTION] ${action}`);
  }
}
