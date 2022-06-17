import {
  db,
  getResourceById,
  createRegion,
  getRegionsFromH3Array,
} from "../src/data/db";
import { Resource, Region } from "../src/data/db.types";

beforeAll(async () => {
  await db.migrate.latest();
  await db.seed.run();
});

afterAll(() => {
  return db.migrate.rollback().then(() => db.destroy());
});

describe("resources", () => {
  it("gets a single resource by id", async () => {
    const result: Resource[] = await getResourceById(1);
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual(1);
    expect(result[0].name).not.toBeFalsy();
  });
});

describe("regions", () => {
  it("gets regions associated with array of h3 indices", async () => {
    const emptyInput: Region[] = await getRegionsFromH3Array([]);
    expect(emptyInput.length).toEqual(0);

    // This H3 index needs to be in the seeded test db
    const resultSingleInput = await getRegionsFromH3Array(["892a306409bffff"]);

    expect(resultSingleInput.length).toEqual(1);
    expect(resultSingleInput[0].h3Index).toEqual("892a306409bffff");
  });

  it("creates a new region with a given h3 index", async () => {
    const result = await createRegion("992a306409bffff");
    expect(result).not.toBeNull();

    if (result) {
      expect(result.length).toEqual(1);
      expect(result[0].h3Index).toEqual("992a306409bffff");

      const date = new Date(result[0].created_at);
      expect(date).toBeTruthy();
    }
  });

  it("does not create duplicate region with same h3 index", async () => {
    const result = await createRegion("992a306409bffff");
    if (result) {
      const result2 = await createRegion("992a306409bffff");
      expect(result2).toBeNull();
    }
  });
});
