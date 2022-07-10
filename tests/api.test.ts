import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, signInWithCustomToken, Auth } from "firebase/auth";
import request from "supertest";
import app from "../src/server";
import { fbAuth as fbAdminAuth } from "../src/auth/firebase-admin";
import { Knex } from "knex";
import { setupDB } from "../src/data/db";
import config from "../src/config";

describe("GET /", () => {
  //
  it("should return status 200", async () => {
    const result = await request(app).get("/");
    expect(result.statusCode).toEqual(200);
  });
});

describe("GET /api", () => {
  //
  it("should return status 403 (unauthorized) when no user authenticated", async () => {
    const result = await request(app).get("/api");
    expect(result.statusCode).toEqual(401);
  });
});

// For the below tests, since we are hitting the real API, we need to setup a database connection for our tests
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

describe("for authorized requests", () => {
  // We use a client firebase SDK to sign in a user to get an ID token for authorized headers
  let token: string;
  let uuid: string;
  beforeAll(async () => {
    const firebaseConfig = {
      apiKey: "AIzaSyDPhUcM2-cwT10bprbtd3qgLTlwgb7zDgM",
      authDomain: "resource-app-8140b.firebaseapp.com",
      projectId: "resource-app-8140b",
      appId: "1:383478522839:web:73d7f2ecc852ec1943a192",
    };

    // Initialize Firebase
    const fb = initializeApp(firebaseConfig);
    const fbAuth = getAuth(fb);

    const customToken = await fbAdminAuth.createCustomToken(
      "FAKE_UUID_FOR_TESTING"
    );
    const credential = await signInWithCustomToken(fbAuth, customToken);
    token = await credential.user.getIdToken();
    uuid = credential.user.uid;
  });

  describe("POST /scan", () => {
    //
    it("should return status 200 (OK) if succesful", async () => {
      await request(app)
        .post("/api/scan")
        .send({
          userPosition: [42.3385453, -71.1193614],
        })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
    });
    it("should return status 400 (bad request) if missing or invalid user position within the body", async () => {
      await request(app)
        .post("/api/scan")
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
      await request(app)
        .post("/api/scan")
        .send({
          userPosition: {
            // incorrect
            latitude: 71,
            longitude: 150,
          },
        })
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
    });
  });

  describe("/users", () => {
    //
    describe("POST /users/add", () => {
      //
      it("should return status 400 (bad request) if missing or invalid uuid", async () => {
        await request(app)
          .post("/api/users/add")
          .send({})
          .set("Authorization", `Bearer ${token}`)
          .expect(400);
      });
      it("should return status 201 (resource created OK) if successful", async () => {
        const response = await request(app)
          .post("/api/users/add")
          .send({
            uuid,
          })
          .set("Authorization", `Bearer ${token}`)
          .expect(201);
        expect(response.body).toHaveProperty("message");
      });
    });
  });
});
