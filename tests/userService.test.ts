import { handleCreateUser } from "./../src/services/userService";
import { Knex } from "knex";
import config from "../src/config";
import { setupDB } from "../src/data/db";
import UserModel from "../src/models/User";

const FAKE_UUID = "FAKE_UUID_FOR_TESTING";

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
  await db("users").del();
});

describe("handleCreateUser()", () => {
  //
  describe("when no uuid exists in the database", () => {
    //
    it("should create a new user with same uuid", async () => {
      try {
        await handleCreateUser({ uuid: FAKE_UUID });
      } catch (err) {
        return false;
      }
      const result = await UserModel.query().where("uuid", FAKE_UUID);
      expect(result).not.toBeUndefined();
      expect(result).toHaveLength(1);
    });
    it("should create an empty inventory for the user", async () => {
      try {
        await handleCreateUser({ uuid: FAKE_UUID });
      } catch (err) {
        return false;
      }
      const result = await UserModel.query().findOne("uuid", FAKE_UUID);

      // https://vincit.github.io/objection.js/api/model/instance-methods.html#validate
      expect(() => result?.$validate()).not.toThrow();
    });
  });
  describe("when a uuid already exists", () => {
    //
    it("should not create a new user", async () => {
      //! NOT PASSING
      try {
        await handleCreateUser({ uuid: FAKE_UUID });
      } catch (err) {
        console.error(err);
        return false;
      }
      const res1 = await UserModel.query().select().where("uuid", FAKE_UUID);
      console.log("res1", res1);
      // Previouly existing user
      expect(res1).toHaveLength(1);
      // Now try to create another user with the same uuid
      const res2 = await handleCreateUser({ uuid: FAKE_UUID });
      console.log("res2", res2);
    });
  });
});
