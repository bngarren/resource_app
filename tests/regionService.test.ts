import { setupDB } from "../src/data/db";
import { Knex } from "knex";
import config from "../src/config";
import RegionModel, { RegionType } from "../src/models/Region";
import {
  handleCreateRegion,
  updateRegion,
} from "../src/services/regionService";
import { datesAreCloseEnough } from "./test-util";
import { handleCreateResource } from "../src/services/resourceService";
import ResourceModel from "../src/models/Resource";

// Each of the resources has an h3Index that is
// resolution 11 and a child of the parent region
const MOCK_DATA = {
  region: {
    h3Index: "892830829cbffff",
  },
  resource_1: {
    name: "Gold",
    region_id: undefined,
    h3Index: "8b2830829c80fff",
    quantity_initial: 100,
    quantity_remaining: 100,
  },
  resource_2: {
    name: "Silver",
    region_id: undefined,
    h3Index: "8b2830829c83fff",
    quantity_initial: 100,
    quantity_remaining: 100,
  },
  resource_3: {
    name: "Iron",
    region_id: undefined,
    h3Index: "8b2830829c86fff",
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

describe("handleCreateRegion()", () => {
  describe("should return null if:", () => {
    it("the h3Index is not valid", async () => {
      const result = await handleCreateRegion({
        h3Index: "abcd", //not valid
      });
      expect(result).toBeNull();
    });
  });
  describe("when a new region is created", () => {
    it("should return a region with a 'reset_date' 3 days from now", async () => {
      const result = await handleCreateRegion({
        h3Index: MOCK_DATA.region.h3Index,
      });
      expect(result?.reset_date).toBeTruthy();
      if (result?.reset_date) {
        const now = new Date();
        const future = new Date(now);
        future.setDate(future.getDate() + 3);

        datesAreCloseEnough(future, new Date(result.reset_date));
      }
    });
  });
});

describe("updateRegion()", () => {
  // Create a test Region for these tests...
  let testRegion: RegionType;
  beforeEach(async () => {
    testRegion = (await handleCreateRegion({
      h3Index: MOCK_DATA.region.h3Index,
    })) as RegionType; // coerce the type since we know it should return non-null
  });
  afterEach(async () => {
    await db("resources").del();
    await RegionModel.query().deleteById(testRegion.id);
  });

  it("should update the region's 'updated_at' column", async () => {
    const yesterday = new Date(new Date());
    yesterday.setDate(yesterday.getDate() - 1);

    // alter the updated_at to setup the test
    await RegionModel.query()
      .patch({ updated_at: yesterday.toISOString() })
      .where("id", testRegion?.id);

    await updateRegion(testRegion.id);
    const updatedRegion = await RegionModel.query().findById(testRegion.id);
    const now = new Date();
    if (updatedRegion?.updated_at) {
      datesAreCloseEnough(now, new Date(updatedRegion.updated_at));
    }
  });
  describe("if no resources are present in this region", () => {
    it("should add 3 new resources with this region_id", async () => {
      const no_resources = await RegionModel.relatedQuery("resources").for(1);
      // No resources to begin with
      expect(no_resources).toHaveLength(0);

      // Update the region (add 3 resources)
      await updateRegion(testRegion.id);

      // Should now have resources
      const has_resources = await RegionModel.relatedQuery<ResourceModel>(
        "resources"
      ).for(testRegion.id);

      expect(has_resources).toHaveLength(3);
      expect(has_resources[0]?.region_id).toEqual(testRegion.id);

      // Take a resource and make sure it's parent region is correct

      const parentRegion = await RegionModel.query().findOne(
        "id",
        has_resources[0].region_id
      );

      expect(has_resources[0].region_id).toEqual(parentRegion?.id);
    });
  });
});
