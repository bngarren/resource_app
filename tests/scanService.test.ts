import { handleScanByUserAtLocation } from "../src/services/scanService";
import { UserPosition } from "../src/types";
import { setupDB } from "../src/data/db";
import { Knex } from "knex";
import config from "../src/config";
import { getRegionsFromH3Array } from "../src/data/query";

// externally validated h3Index's (resolution 9) with
// kRing distance of 1 (first element is center)
const MOCK_DATA = {
  h3Index: "89283082837ffff",
  h3Group: [
    "89283082837ffff", // user's h3Index
    "89283082833ffff",
    "89283082823ffff",
    "89283082827ffff",
    "892830829cbffff",
    "892830829dbffff",
    "892830828afffff",
  ],
  userPosition: {
    latitude: 37.777493908651344,
    longitude: -122.42904243437428,
  },
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

// TODO Some big side effects
// Since no resources are seeded, each time that handleScanByUserAtLocation
// fires it also calls updateRegion on region's that have
// no resources, so they are created
// * We could mock the create resource function??
describe.skip("handleScanByUserAtLocation()", () => {
  describe("when no associated regions exist in the database", () => {
    it("creates 7 new regions with the correct h3Index's", async () => {
      const q = await getRegionsFromH3Array(MOCK_DATA.h3Group);
      expect(q).toHaveLength(0);

      await handleScanByUserAtLocation(1, MOCK_DATA.userPosition);

      const regions = await getRegionsFromH3Array(MOCK_DATA.h3Group);
      expect(regions).toHaveLength(7);

      const regionsH3 = regions.map((r) => r.h3Index);

      expect(MOCK_DATA.h3Group.sort()).toEqual(regionsH3.sort());
    });
    it("returns a result object that contains `regions`", async () => {
      const result = await handleScanByUserAtLocation(
        1,
        MOCK_DATA.userPosition
      );
      expect(result).toHaveProperty("regions");

      if (result !== -1) {
        expect(result.regions[0]).toHaveProperty("h3Index");
      }
    });
  });
  describe("when some regions exist in the database", () => {
    it("creates only the non-existent regions", async () => {
      await db("regions").insert([
        { h3Index: MOCK_DATA.h3Group[0] },
        { h3Index: MOCK_DATA.h3Group[1] },
      ]);
      const q = await db("regions").select("h3Index");
      expect(q).toHaveLength(2);
      await handleScanByUserAtLocation(1, MOCK_DATA.userPosition);
      const result = await db("regions").select("h3Index");
      expect(result).toHaveLength(7);
      expect(new Set(result).size).toBe(7); // no duplicates
    });
  });
  describe("when the scan result is returned", () => {
    it("includes `regions` with each region having an `updated_at` of now", async () => {
      const result = await handleScanByUserAtLocation(
        1,
        MOCK_DATA.userPosition
      );

      if (result !== -1) {
        const region1 = result.regions[0];
        const now = new Date();
        const updated_at = new Date(region1.updated_at || 1);
        expect(now.getUTCDay()).toEqual(updated_at.getUTCDay());
        expect(now.getUTCMinutes()).toEqual(updated_at.getUTCMinutes());
      }
    });
  });
});
