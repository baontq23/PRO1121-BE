import { Request, Response, NextFunction } from "express";
import { AppDataSource } from '../data-source';
import { Teacher } from "../entity/Teacher";

export const checkRole = (roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //Get the user ID from previous midleware
    const id = res.locals.jwtPayload.userId;

    //Get user role from the database
    const userRepository = AppDataSource.getRepository(Teacher);
    let user: Teacher;
    try {
      user = await userRepository.findOneOrFail({where:{id:id}});
      next();
    } catch (e) {
      res.status(401).send();
    }
  };
};
