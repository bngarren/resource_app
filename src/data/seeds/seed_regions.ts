import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("regions").del();

  // Inserts seed entries
  await knex("regions").insert([{ h3Index: "892a306409bffff" }]);
}
