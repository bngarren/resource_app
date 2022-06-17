import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("resources").del();

  // Inserts seed entries
  await knex("resources").insert([
    { id: 1, name: "Stone", quantity_initial: 100, quantity_remaining: 100 },
    { id: 2, name: "Silver", quantity_initial: 100, quantity_remaining: 95 },
  ]);
}
