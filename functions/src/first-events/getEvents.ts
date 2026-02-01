import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { Firestore } from "firebase-admin/firestore";
import { IntParam, SecretParam } from "firebase-functions/params";

/**
 * A placeholder Firebase Function.
 */
export const placeholderFunction = (
  db: Firestore,
  apiToken: SecretParam,
  season: IntParam
) => onCall(
  { secrets:[apiToken],
    enforceAppCheck: true
  },
  (request) => {
  logger.info("Placeholder function called", { data: request.data });
  return {
    message: "This is a placeholder response.",
    timestamp: new Date().toISOString(),
  };
});
