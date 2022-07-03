import { Model, ModelObject } from "objection";

export default class UserModel extends Model {
  id!: number;
  uuid!: string;

  inventory?: object;

  static tableName = "users";

  static getEmptyInventory = () => ({
    metadata: {
      updated_at: new Date().toISOString(),
    },
    items: {},
  });

  static get jsonSchema() {
    return {
      type: "object",
      required: ["uuid", "inventory"],

      properties: {
        id: { type: "integer", readOnly: true },
        uuid: {
          type: "string",
        },
        inventory: {
          type: "object",
          required: ["metadata", "items"],
          properties: {
            metadata: {
              type: "object",
              required: ["updated_at"],
              properties: {
                updated_at: { type: "string", readOnly: true },
              },
            },
            items: {
              type: "object",
              propertyNames: {
                pattern: "/[0-9]+/", // must be positive integer
              },
              properties: {
                id: { type: "integer", readOnly: true },
                name: { type: "string", readOnly: true },
              },
            },
          },
        },
      },
    };
  }
}

export type UserType = ModelObject<UserModel>;
