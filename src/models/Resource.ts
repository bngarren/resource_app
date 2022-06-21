import { Model, ModelObject } from "objection";
import RegionModel from "./Region";

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
