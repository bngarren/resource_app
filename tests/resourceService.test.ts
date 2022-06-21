import { setupDB } from "../src/data/db";
import { Knex } from "knex";
import config from "../src/config";
import { handleCreateResource } from "../src/services/resourceService";
import RegionModel, { RegionType } from "../src/models/Region";

const MOCK_DATA = {
  region: {
    h3Index: "89283082837ffff",
  },
  resource: {
    name: "Gold",
    region_id: undefined,
    h3Index: "89283082aafffff",
    quantity_initial: 100,
    quantity_remaining: 100,
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

describe("handleCreateResource()", () => {
  // Create a dummy Region row (needed for FK's)
  let newRegion: RegionModel;
  let insertedRegion: RegionType;
  beforeEach(async () => {
    newRegion = RegionModel.fromJson(MOCK_DATA.region);
    [insertedRegion] = (await db("regions")
      .insert(newRegion)
      .returning("*")) as RegionType[];
  });
  afterEach(async () => {
    await db("resources").del();
    await db("regions").where("id", insertedRegion.id).del();
  });

  describe("should return null if:", () => {
    it("the region_id doesn't reference a foreign key", async () => {
      const result = await handleCreateResource({
        ...MOCK_DATA.resource,
        region_id: 123456789, // not valid
      });
      expect(result).toBeNull();
    });
    it("the h3Index is not valid", async () => {
      const result = await handleCreateResource({
        ...MOCK_DATA.resource,
        region_id: insertedRegion.id,
        h3Index: "abcd", //not valid
      });
      expect(result).toBeNull();
    });
  });
});
