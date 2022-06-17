import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("resources", function (table) {
    table.increments("id");
    table.string("name", 255).notNullable();
    table.integer("quantity_initial").notNullable();
    table.integer("quantity_remaining").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("resources");
}
