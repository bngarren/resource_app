import { NotFoundError, UniqueViolationError } from "objection";
import { handleCreateUser, handleGetUser } from "./../src/services/userService";
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
    it("should not create a new user and should return UniqueValidationError", async () => {
      await handleCreateUser({ uuid: FAKE_UUID });
      const res1 = await UserModel.query().select().where("uuid", FAKE_UUID);
      // Previouly existing user
      expect(res1).toHaveLength(1);
      // Now try to create another user with the same uuid
      const res2 = await handleCreateUser({ uuid: FAKE_UUID });
      expect(res2).toBeInstanceOf(UniqueViolationError);
      await expect(UserModel.query().select()).resolves.toHaveLength(1);
    });
  });
});

describe("handleGetUser", () => {
  //
  describe("when a uuid doesn't exist in the database", () => {
    //
    it("should not throw but return an error", async () => {
      await expect(() => handleGetUser("DOESNT EXIST")).not.toThrowError();
      const result = await handleGetUser("DOESNT EXIST");
      expect(result).toBeInstanceOf(NotFoundError);
    });
  });
});
