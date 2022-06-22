import { Model, ModelObject, ValidationError } from "objection";
import RegionModel from "./Region";
import h3 from "h3-js";

export default class ResourceModel extends Model {
  id!: number;
  name!: string;
  region_id!: number;
  h3Index!: string;
  quantity_initial!: number;
  quantity_remaining!: number;

  static tableName = "resources";

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "name",
        "region_id",
        "h3Index",
        "quantity_initial",
        "quantity_remaining",
      ],

      properties: {
        id: { type: "integer", readOnly: true },
        name: {
          type: "string",
        },
        region_id: {
          type: "integer",
        },
        h3Index: {
          type: "string",
        },
        quantity_initial: { type: "integer" },
        quantity_remaining: { type: "integer" },
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
  }

  static relationMappings = () => ({
    region: {
      relation: Model.BelongsToOneRelation,
      modelClass: RegionModel,
      join: {
        from: "resources.region_id",
        to: "regions.id",
      },
    },
  });
}

export type ResourceType = ModelObject<ResourceModel>;
