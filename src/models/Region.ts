import { Model, ModelObject, ValidationError } from "objection";
import ResourceModel from "./Resource";
import h3 from "h3-js";

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

  $beforeInsert() {
    // Check to make sure the input h3Index is valid
    if (!h3.h3IsValid(this.h3Index)) {
      throw new ValidationError({
        message: "h3Index is invalid",
        type: "ModelValidation",
      });
    }

    // Update the "reset_date"
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 3);
    this.reset_date = future.toISOString();
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
