import { beforeUserCreated } from "firebase-functions/v2/identity";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Blocks any user from registering if their email domain is not waltonrobotics.org.
 */
export const validateUserDomain = beforeUserCreated((event) => {
  const user = event.data;
  const email = user?.email;
  const domain = "waltonrobotics.org";

  // This regex ensures the email is in a valid format and belongs to the specified domain.
  // 1. It must not contain multiple '@' symbols.
  // 2. The domain must be 'waltonrobotics.org' (case-insensitive).
  const domainRegex = new RegExp(`^[^@\\s]+@${domain.replace(/\./g, "\\.")}$`, "i");

  if (!email || !domainRegex.test(email)) {
    throw new HttpsError(
      "permission-denied",
      `Remember to use your @${domain} email address to sign-up.`
    );
  }
});
