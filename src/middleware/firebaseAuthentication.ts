import { NextFunction, Request, Response } from "express";
import { fbAuth } from "../auth/firebase-admin";
import { logger } from "../logger";

/**
 * Use this function when authentication fails to send the response back to the
 * client and log the error
 * @param res Response
 * @param status Status code
 * @param error Error message
 */
const authFailed = (res: Response, status: number, error: string) => {
  logger.warn(error);
  res.status(status).json({
    error,
    ok: false,
  });
};

/**
 * Firebase authentication middleware
 *
 * Intercepts the incoming Request and checks for an id token from the client/user and
 * validates this with firebase auth. If no token or invalid token, will send error status code
 * back to the client. If valid token, will attach the decoded token (contain uid) to the
 * request object for downstream middleware and controllers to use.
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function - calls next middleware
 * @returns void
 */
const firebaseAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization.split(" ");

      // Check if the auth header follows the "bearer" pattern
      if (authHeader[0] === "Bearer") {
        // https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_the_firebase_admin_sdk
        // The verifyIdToken needs a project ID, but should be taken care of if firebase admin has been initialised properly
        //
        // Attach decoded token to req object to use downstream
        // Users can choose what key to attach the decoded token to.
        req.authenticatedUser = await fbAuth.verifyIdToken(
          authHeader[1],
          false
        );

        // Break out of this middleware and continue with the next one
        return next();
      }
    }
    // If token missing or token malformed, end the request in this middleware
    // 401 Missing auth token thus unauthorised
    authFailed(res, 401, "MISSING OR MALFORMED AUTH");
  } catch (error) {
    let message = "Authentication error";
    if (error instanceof Error) message = error.message;
    authFailed(res, 403, message);
  }
};

export default firebaseAuthentication;
