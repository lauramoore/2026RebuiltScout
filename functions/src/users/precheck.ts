import { beforeUserCreated } from "firebase-functions/v2/identity";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Blocks any user from registering if their email domain is not waltonrobotics.org.
 */
export const validateUserDomain = beforeUserCreated((event) => {
  const user = event.data;
  const email = user?.email;
  const domain = "waltonrobotics.org";

  // Firebase Auth validates the basic email format, so we only need to check the domain.
  if (!email || !email.toLowerCase().endsWith(`@${domain}`)) {
    throw new HttpsError(
      "permission-denied",
      `Remember to use your @${domain} email address to sign-up.`
    );
  }
});
