import { db } from "../src/data/db";
import { handleScanByUserAtLocation } from "../src/services/scanService";
import { UserPosition } from "../src/types";

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

beforeAll(async () => {
  await db.migrate.latest();
  await db.seed.run();
});

afterAll(() => {
  return db.migrate.rollback().then(() => db.destroy());
});

describe("handleScanByUserAtLocation()", () => {
  beforeEach(async () => {
    await db("regions").del();
  });

  describe("when no regions exist in the database", () => {
    it("creates 7 new regions with the correct h3Index's", async () => {
      const select1 = await db("regions").select();

      await handleScanByUserAtLocation(1, MOCK_DATA.userPosition);

      const select2 = await db("regions")
        .select()
        .whereIn("h3Index", MOCK_DATA.h3Group);

      const h3GroupDb = select2.map((r) => r.h3Index);

      expect(select1).toHaveLength(0);
      expect(select2.length).toBe(MOCK_DATA.h3Group.length);
      expect(MOCK_DATA.h3Group.sort()).toEqual(h3GroupDb.sort());
    });
  });
  describe("when some regions exist in the database", () => {
    it("creates only the non-existent regions", async () => {
      const select1 = await db("regions").select();

      const inserted = await db("regions")
        .insert([
          { h3Index: MOCK_DATA.h3Group[0] },
          { h3Index: MOCK_DATA.h3Group[1] },
        ])
        .returning("id");

      await handleScanByUserAtLocation(1, MOCK_DATA.userPosition);

      const select2 = await db("regions")
        .select()
        .whereIn("h3Index", MOCK_DATA.h3Group);

      const h3GroupDb = select2.map((r) => r.h3Index);

      expect(select1).toHaveLength(0);
      expect(inserted).toHaveLength(2);
      expect(select2.length).toBe(MOCK_DATA.h3Group.length);
      expect(MOCK_DATA.h3Group.sort()).toEqual(h3GroupDb.sort());
    });
  });
});
