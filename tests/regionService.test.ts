import { setupDB } from "../src/data/db";
import { Knex } from "knex";
import config from "../src/config";

const MOCK_DATA = {};

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

describe("updateRegion()", () => {});
