import { AddUserRequest } from "./../types/index";
import { userService } from "./../services";
import { Request, Response } from "express";

export const add = async (
  req: Request<unknown, unknown, AddUserRequest>,
  res: Response
) => {
  const { body } = req;

  const result = await userService.handleCreateUser(body);

  if (!result) {
    res.sendStatus(500);
  } else {
    res.send(result);
  }
};
