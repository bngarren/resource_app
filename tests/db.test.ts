import { db, getResourceById } from "../src/data/db";
import { Resource } from "../src/data/db.types";

describe("resources", () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });
  afterAll(() => {
    return db.migrate.rollback().then(() => db.destroy());
  });

  it("gets a single resource by id", async () => {
    const result: Resource[] = await getResourceById(1);
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual(1);
    expect(result[0].name).not.toBeFalsy();
  });
});
