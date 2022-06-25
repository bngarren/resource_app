import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import config from "../config";

const serviceAccount = JSON.parse(config.fb_service_acct_key || "");

export const fbAdmin = initializeApp({
  credential: cert(serviceAccount),
});

export const fbAuth = getAuth();
