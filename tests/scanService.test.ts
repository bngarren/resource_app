import { handleScanByUserAtLocation } from "../src/services/scanService";
import { UserPosition } from "../src/types";
import { db } from "../src/data/db";

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

describe("handleScanByUserAtLocation()", () => {
  describe("when no regions exist in the database", () => {
    it("creates 7 new regions with the correct h3Index's", async () => {
      expect(true).toBe(false);
    });
  });
  describe("when some regions exist in the database", () => {
    it("creates only the non-existent regions", async () => {
      expect(true).toBe(false);
    });
  });
});
