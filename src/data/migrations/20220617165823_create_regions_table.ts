import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("regions", function (table) {
    table.increments("id");
    table.string("h3Index", 50).notNullable().unique();
    table
      .timestamp("created_at", { useTz: true, precision: 2 })
      .notNullable()
      .defaultTo(knex.fn.now(2));
    table.timestamp("updated_at", { useTz: true, precision: 2 });

    table.timestamp("reset_date", { useTz: true, precision: 2 });
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("regions");
}
