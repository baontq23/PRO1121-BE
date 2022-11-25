import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { validate } from 'class-validator';
import { Teacher } from '../entity/Teacher';

class AuthController {
  static login = async (req: Request, res: Response) => {
    //Check if username and password are set
    const { phone, password } = req.body;
    if (!(phone && password)) {
      res.status(400).send();
    }

    //Get user from database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    let teacher: Teacher;
    try {
      teacher = await teacherRepository.findOneOrFail({
        where: { phone }
      });
    } catch (error) {
      res.status(401).send();
      return;
    }

    //Check if encrypted password match
    if (!teacher.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).send();
      return;
    }
    res.send({
      error: false,
      code: 200,
      data: teacher
    });
  };

  static changePassword = async (req: Request, res: Response) => {
    const id = req.body.teacher_id;

    //Get parameters from the body
    const { old_password, new_password } = req.body;
    if (!(old_password && new_password)) {
      res.status(400).send();
    }

    //Get user from the database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    let teacher: Teacher;
    try {
      teacher = await teacherRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      console.log(error);
      res.status(401).send();
      return;
    }

    //Check if old password matchs
    if (!teacher.checkIfUnencryptedPasswordIsValid(old_password)) {
      res.status(401).send();
      return;
    }

    //Validate de model (password lenght)
    teacher.password = new_password;
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
