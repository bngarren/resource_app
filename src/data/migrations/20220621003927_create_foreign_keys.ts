import { Knex } from "knex";

// We run the foreign key additions in a separate migration to
// ensure that the referenced tables are already created

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("resources", (table) => {
    table.foreign("region_id").references("id").inTable("regions");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("resources", (table) => {
    table.dropForeign("region_id");
  });
}
