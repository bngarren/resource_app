import { handleScan } from "../src/services/scanService";
import { UserPosition } from "../src/types";
import { setupDB } from "../src/data/db";
import { Knex } from "knex";
import config from "../src/config";
import { getRegionsFromH3Array } from "../src/data/queries/queryRegion";
import h3 from "h3-js";
import { REGION_H3_RESOLUTION } from "../src/constants";
import { expectDatesAreCloseEnough } from "./test-util";
import ResourceModel from "../src/models/Resource";
import { handleCreateResource } from "../src/services/resourceService";
import RegionModel from "../src/models/Region";
import { handleCreateRegion } from "../src/services/regionService";

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
  userPosition: [37.777493908651344, -122.42904243437428] as UserPosition,
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
describe("handleScanByUserAtLocation()", () => {
  //
  describe("when no associated regions exist in the database", () => {
    //
    it("creates 7 new regions with the correct h3Index's", async () => {
      expect(getRegionsFromH3Array(MOCK_DATA.h3Group)).resolves.toHaveLength(0);

      try {
        await handleScan(MOCK_DATA.userPosition);

        const regions = await getRegionsFromH3Array(MOCK_DATA.h3Group);
        expect(regions).toHaveLength(7);

        if (regions == null) return false;

        const regionsH3 = regions.map((r) => r.h3Index);

        expect(MOCK_DATA.h3Group.sort()).toEqual(regionsH3.sort());
      } catch (err) {
        return false;
      }
    });
  });
  describe("when some regions exist in the database", () => {
    //
    it("creates only the non-existent regions", async () => {
      await db("regions").insert([
        { h3Index: MOCK_DATA.h3Group[0] },
        { h3Index: MOCK_DATA.h3Group[1] },
      ]);
      const q = await db("regions").select("h3Index");
      expect(q).toHaveLength(2);
      try {
        await handleScan(MOCK_DATA.userPosition);
        const result = await db("regions").select("h3Index");
        expect(result).toHaveLength(7);
        expect(new Set(result).size).toBe(7); // no duplicates
      } catch (err) {
        return false;
      }
    });
  });
  describe("when the scan result is returned", () => {
    //
    it("includes `regions` with each region having an `updated_at` of now", async () => {
      try {
        const result = await handleScan(MOCK_DATA.userPosition);
        const region1 = result.regions[0];
        const now = new Date();
        const updated_at = new Date(region1.updated_at || 1);
        expectDatesAreCloseEnough(now, updated_at);
      } catch (err) {
        return false;
      }
    });
    it("includes the number of regions equal to the number of h3 indexes in the scan area", async () => {
      const scanDistance = 1;
      try {
        const scanResult = await handleScan(
          MOCK_DATA.userPosition,
          scanDistance
        );
        const h3Index = h3.geoToH3(
          MOCK_DATA.userPosition[0],
          MOCK_DATA.userPosition[1],
          REGION_H3_RESOLUTION
        );
        const h3Group = h3.kRing(h3Index, scanDistance);
        expect(scanResult.regions).toHaveLength(h3Group.length);
      } catch (err) {
        return false;
      }
    });
    it("includes an array of interactable resources (by id) if the user is close enough to a resource", async () => {
      // Create region with resources
      const region = await handleCreateRegion(
        {
          h3Index: MOCK_DATA.h3Index,
        },
        true
      );
      if (region == null) return false;
      const resource = await region
        .$relatedQuery<ResourceModel>("resources")
        .first();
      if (resource == null) return false;
      const userPosition = h3.h3ToGeo(resource.h3Index);
      // the user scans and is not near the resource
      try {
        const scanResult_far = await handleScan(MOCK_DATA.userPosition, 1);
        // the user scans and is within the resource
        const scanResult_close = await handleScan(userPosition, 1);
        expect(scanResult_close.interactableResources).toEqual(
          expect.arrayContaining([resource.id])
        );
        expect(scanResult_far.interactableResources).not.toEqual(
          expect.arrayContaining([resource.id])
        );
      } catch (err) {
        return false;
      }
    });
  });
});
