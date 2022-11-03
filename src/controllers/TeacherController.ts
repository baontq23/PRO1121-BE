import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { AppDataSource } from '../data-source';
import { Teacher } from '../entity/Teacher';

class TeacherController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    const teachers = await teacherRepository.find({
      select: ['id', 'username', 'phone', 'dob']
    });

    //Send the users object
    res.send(teachers);
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: number = parseInt(req.params.id);
    //Get the user from database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    try {
      const user = await teacherRepository.findOneOrFail({
        where: { id: id },
        select: ['id', 'username', 'phone'] //We dont want to send the password on response
      });
      res.send({ error: false, result: user });
    } catch (error) {
      res.status(404).send('User not found');
    }
  };

  static newUser = async (req: Request, res: Response) => {
    //Get parameters from the body

    
    let { username, password, name } = req.body;
    let teacher = new Teacher();
    teacher.username = username;
    teacher.password = password;
    teacher.name = name;

    //Validade if the parameters are ok
    const errors = await validate(teacher);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //Hash the password, to securely store on DB
    teacher.hashPassword();

    //Try to save. If fails, the username is already in use
    const teacherRepository = AppDataSource.getRepository(Teacher);
    try {
      await teacherRepository.save(teacher);
    } catch (e) {
      console.log(e);
      res.status(409).send('Username already in use');
      return;
    }

    //If all ok, send 201 response
    res.status(201).send('User created');
  };

  static editUser = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: number = parseInt(req.params.id);

    //Get values from the body
    const { username } = req.body;

    //Try to find user on database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    let teacher: Teacher;
    try {
      teacher = await teacherRepository.findOneOrFail({ where: { id: id } });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send('Teacher not found');
      return;
    }

    //Validate the new values on model
    teacher.username = username;
    const errors = await validate(teacher);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //Try to safe, if fails, that means username already in use
    try {
      await teacherRepository.save(teacher);
    } catch (e) {
      res.status(409).send('username already in use');
      return;
    }
    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  static deleteUser = async (req: Request, res: Response) => {
    //Get the ID from the url
    // const id = parseInt(req.params.id);
    // const teacherRepository = AppDataSource.getRepository(User);
    // let user: User;
    // try {
    //   user = await teacherRepository.findOneOrFail({ where: { id: id } });
    // } catch (error) {
    //   res.status(404).send("User not found");
    //   return;
    // }
    // teacherRepository.delete(id);
    // //After all send a 204 (no content, but accepted) response
    // res.status(204).send();
  };
}

export default TeacherController;
