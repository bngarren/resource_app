import request from "supertest";
import app from "../src/server";

describe("GET /", () => {
  it("should return status 200", async () => {
    const result = await request(app).get("/");
    expect(result.statusCode).toEqual(200);
  });
});

describe("GET /api", () => {
  it("should return status 403 (unauthorized) when no user authenticated", async () => {
    const result = await request(app).get("/api");
    expect(result.statusCode).toEqual(401);
  });
});
