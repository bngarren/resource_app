export interface Resource {
  id: number;
  name: string;
  quantity_initial: number;
  quantity_remaining: number;
}

export interface Resources {
  [key: number]: Resource;
}
