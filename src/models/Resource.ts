import { Model, ModelObject } from "objection";

export default class ResourceModel extends Model {
  id!: number;
  name!: string;
  quantity_initial!: string;
  quantity_remaining!: string;

  static tableName = "resources";

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name", "quantity_initial", "quantity_remaining"],

      properties: {
        id: { type: "integer", readOnly: true },
        name: {
          type: "string",
        },
        quantity_initial: { type: "integer" },
        quantity_remaining: { type: "integer" },
      },
    };
  }
}

export type ResourceType = ModelObject<ResourceModel>;
