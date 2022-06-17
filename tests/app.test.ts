import request from "supertest";
import app from "../src/server";

describe("GET /", () => {
  it("should return status 200", async () => {
    const result = await request(app).get("/");
    expect(result.statusCode).toEqual(200);
  });
});
