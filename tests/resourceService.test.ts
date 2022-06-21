import { setupDB } from "../src/data/db";
import { Knex } from "knex";
import config from "../src/config";
import { handleCreateResource } from "../src/services/resourceService";

const MOCK_DATA = {
  resource: {
    name: "Gold",
    region_id: "89283082837ffff",
    h3Index: "test",
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
  describe("should return null if:", () => {
    it("a region_id doesn't reference a foreign key", async () => {
      const result = await handleCreateResource({
        ...MOCK_DATA.resource,
        region_id: 1,
      });
      expect(result).toBeNull();
    });
  });
});
