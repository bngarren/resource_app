import { UserRecord } from "firebase-admin/auth";
import { Knex } from "knex";
import { fbAuth } from "../../auth/firebase-admin";
import UserModel from "../../models/User";

export async function seed(knex: Knex): Promise<void> {
  // Get testuser@gmail.com from firebase
  let testUser: UserRecord | null = null;
  try {
    testUser = await fbAuth.getUserByEmail("testuser@gmail.com");
  } catch (err) {
    console.log(
      "Error fetching test user data from firebase for seeding:",
      err
    );
  }

  if (!testUser) return;

  // Inserts seed entries
  await knex("users")
    .insert({
      id: 999999,
      uuid: testUser.uid,
      inventory: UserModel.getEmptyInventory(),
    })
    .onConflict("uuid")
    .ignore();
}
