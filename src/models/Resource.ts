import { Model, ModelObject } from "objection";

export default class ResourceModel extends Model {
  id!: number;
  name!: string;
  quantity_initial!: string;
  quantity_remaining!: string;

  static tableName = "resources";
}

export type ResourceType = ModelObject<ResourceModel>;
