import { Model, ModelObject } from "objection";
import ResourceModel from "./Resource";

export default class RegionModel extends Model {
  id!: number;
  h3Index!: string;
  created_at!: string;

  updated_at?: string;
  reset_date?: string;

  static tableName = "regions";

  static get jsonSchema() {
    return {
      type: "object",
      required: ["h3Index"],

      properties: {
        id: { type: "integer", readOnly: true },
        h3Index: {
          type: "string",
        },
        created_at: { type: "string", readOnly: true },
        updated_at: { type: "string", readOnly: true },
        reset_date: { type: "string", readOnly: true },
      },
    };
  }

  static relationMappings = () => ({
    resources: {
      relation: Model.HasManyRelation,
      modelClass: ResourceModel,
      join: {
        from: "regions.id",
        to: "resources.region_id",
      },
    },
  });
}

export type RegionType = ModelObject<RegionModel>;
