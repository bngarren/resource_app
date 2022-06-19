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

describe("handleScanByUserAtLocation()", () => {
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
});
