import { beforeAll, afterAll, afterEach, vi } from "vitest";
import { rest } from "msw";
import { setupServer } from "msw/node";
import config from "../config";

// We use msw to intercept the network request during the test
export const handlers = [
  rest.get(config.api_url + "/*", (req, res, ctx) => {
    return res(ctx.json("Test"), ctx.delay(150));
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
