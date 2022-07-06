import { AddUserRequest } from "./../types/index";
import { userService } from "./../services";
import { Request, Response } from "express";

export const add = async (
  req: Request<unknown, unknown, AddUserRequest>,
  res: Response
) => {
  const { body } = req;

  if (!body["uuid"]) {
    res.status(400).send("Need a uuid to add a new user");
    return;
  }

  const result = await userService.handleCreateUser(body);

  if (!result) {
    res.sendStatus(500);
  } else {
    res.send(result);
  }
};

export const getInventoryItemsForUser = async (
  req: Request<{ uuid: string }, unknown, unknown>,
  res: Response
) => {
  const { uuid } = req.params;

  if (!uuid) {
    res.status(400).send("Need a user uuid to get the inventory");
    return;
  }

  const result = await userService.getInventoryItemsForUser(uuid);

  if (!result) {
    res.sendStatus(500);
  } else {
    res.send(result);
  }
};
