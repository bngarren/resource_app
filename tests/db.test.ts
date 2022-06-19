import { setupDB } from "../src/data/db";
import config from "../src/config";
import {
  getResourceById,
  createRegion,
  getRegionsFromH3Array,
} from "../src/data/query";
import type { ResourceType } from "../src/models/Resource";
import type { RegionType } from "../src/models/Region";
import RegionModel from "../src/models/Region";
import { Knex } from "knex";

// externally validated h3Index's (resolution 9) with
// kRing distance of 1 (first element is center)
const MOCK_DATA = {
  h3Index: "89283082837ffff",
};

let db: Knex;

beforeAll(async () => {
  db = setupDB(config.node_env || "test", true) as Knex;
  await db.migrate.rollback();
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

afterEach(async () => {
  await db("resources").del();
  await db("regions").del();
});

describe("Resources", () => {
  describe("getResourceById()", () => {
    it("gets a single resource by id", async () => {
      const insert: RegionType[] = await db("resources")
        .insert({
          name: "test",
          quantity_initial: 100,
          quantity_remaining: 100,
        })
        .returning("*");

      const inserted = insert[0];
      const result = await getResourceById(inserted.id);

      if (!result) return;

      expect(result.id).toEqual(inserted.id);
      expect(result.name).toEqual("test");
    });

    it("returns null if no resource found with id", async () => {
      const result = await getResourceById(12345);
      expect(result).toBeNull();
    });
  });
});

describe("Regions", () => {
  it("gets regions associated with array of h3 indices", async () => {
    const emptyInput: RegionType[] = await getRegionsFromH3Array([]);

    await RegionModel.query().insert({
      h3Index: MOCK_DATA.h3Index,
      created_at: new Date().toISOString(),
    });

    const resultSingleInput = await getRegionsFromH3Array([MOCK_DATA.h3Index]);

    expect(emptyInput.length).toEqual(0);
    expect(resultSingleInput.length).toEqual(1);
    expect(resultSingleInput[0].h3Index).toEqual(MOCK_DATA.h3Index);
  });

  describe("createRegion", () => {
    it("creates a new region with a given h3 index", async () => {
      const result = await createRegion(MOCK_DATA.h3Index);
      expect(result).not.toBeNull();

      if (result) {
        expect(result.h3Index).toEqual(MOCK_DATA.h3Index);

        const date = new Date(result.created_at);
        expect(date).toBeTruthy();
      }
    });

    it("does not create duplicate region with same h3 index", async () => {
      const result = await createRegion(MOCK_DATA.h3Index);
      if (result) {
        const result2 = await createRegion(MOCK_DATA.h3Index);
        expect(result2).toBeNull();
      }
    });

    it("creates a new region with a created_at equal to now", async () => {
      const result = await createRegion(MOCK_DATA.h3Index);
      if (result) {
        const now = new Date();
        const created_at = new Date(result.created_at);
        expect(now.getUTCDay()).toEqual(created_at.getUTCDay());
        expect(now.getUTCMinutes()).toEqual(created_at.getUTCMinutes());
      }
    });
  });
});
