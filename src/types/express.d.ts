/* eslint-disable @typescript-eslint/no-unused-vars */
import { Express } from "express-serve-static-core";
import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: DecodedIdToken | null;
    }
  }
}
