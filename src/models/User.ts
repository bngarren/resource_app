import { Model, ModelObject } from "objection";

export default class UserModel extends Model {
  id!: number;
  uuid!: string;

  static tableName = "users";

  static get jsonSchema() {
    return {
      type: "object",
      required: ["uuid"],

      properties: {
        id: { type: "integer", readOnly: true },
        uuid: {
          type: "string",
        },
      },
    };
  }
}

export type UserType = ModelObject<UserModel>;
