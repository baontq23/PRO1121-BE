import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { validate } from "class-validator";

import { Teacher } from "../entity/Teacher";
import config from "../config/config";

class AuthController {
  static login = async (req: Request, res: Response) => {
    //Check if username and password are set
    let { username, password } = req.body;
    if (!(username && password)) {
      res.status(400).send();
    }

    //Get user from database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    let teacher: Teacher;
    try {
      teacher = await teacherRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      res.status(401).send();
    }

    //Check if encrypted password match
    if (!teacher.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).send();
      return;
    }
    res.send({
      error: false,
      code: 200,
      message: "Login successfully!"
    });
  };

  static changePassword = async (req: Request, res: Response) => {
    //Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    //Get parameters from the body
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    //Get user from the database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    let teacher: Teacher;
    try {
      teacher = await teacherRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).send();
    }

    //Check if old password matchs
    if (!teacher.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(401).send();
      return;
    }

    //Validate de model (password lenght)
    teacher.password = newPassword;
    const errors = await validate(teacher);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    //Hash the new password and save
    teacher.hashPassword();
    teacherRepository.save(teacher);

    res.status(204).send();
  };
}
export default AuthController;
