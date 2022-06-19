import expressPino from "express-pino-logger";

// Custom middleware to pino log incoming requests
export const logRequest = expressPino();
