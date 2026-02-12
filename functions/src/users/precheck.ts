import { beforeUserCreated } from "firebase-functions/v2/identity";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Blocks any user from registering if their email domain is not waltonrobotics.org.
 */
export const validateUserDomain = beforeUserCreated((event) => {
  const user = event.data;

  if (!user?.email?.endsWith("@waltonrobotics.org")) {
    throw new HttpsError(
      "permission-denied",
      "Remember to use your @waltonrobotics.org email address to sign-up."
    );
  }
});
