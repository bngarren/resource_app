import { Knex } from "knex";

export interface Resource {
  id: number;
  name: string;
  quantity_initial: number;
  quantity_remaining: number;
}

export interface Resources {
  [key: number]: Resource;
}

export interface Region {
  id: number;
  h3Index: string;
  created_at: string;
  last_updated_at: string;
  reset_date: string;
}

export interface Regions {
  [key: number]: Region;
}

declare module "knex/types/tables" {
  interface Tables {
    resources: Resource;
    resources_composite: Knex.CompositeTableType<
      Resource,
      Pick<Resource, "name" | "quantity_initial" | "quantity_remaining">,
      Partial<Omit<Resource, "id">>
    >;
    regions: Region;
  }
}
