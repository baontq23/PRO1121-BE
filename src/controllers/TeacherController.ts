import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { AppDataSource } from '../data-source';
import { Teacher } from '../entity/Teacher';

class TeacherController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    const teachers = await teacherRepository.find({
      select: ['id', 'name', 'phone', 'dob']
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
        select: ['id', 'name', 'phone'] //We dont want to send the password on response
      });
      res.send({ error: false, result: user });
    } catch (error) {
      res.status(404).send('User not found');
    }
  };

  static newUser = async (req: Request, res: Response) => {
    //Get parameters from the body
    
    let { phone, password, name, email } = req.body;
    let teacher = new Teacher();
    teacher.phone = phone;
    teacher.password = password;
    teacher.name = name;
    teacher.email = email;

    //Validade if the parameters are ok
    const errors = await validate(teacher);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message:  errors[0].constraints
      });
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
      res.status(409).send({
        error: true,
        code: 409,
        message: 'Email hoặc số điện thoại đã được đăng ký, vui lòng đăng nhập hoặc thử lại với thông tin khác!'
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({
      error: false,
      code: 201,
      message: 'Đăng ký thành công!'
    });
  };

  static editUser = async (req: Request, res: Response) => {
    //Get values from the body
    const { teacher_id, teacher_name, teacher_email, teacher_dob, teacher_phone } = req.body;

    //Try to find user on database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    let teacher: Teacher;
    try {
      teacher = await teacherRepository.findOneOrFail({ where: { id: teacher_id } });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Giáo viên không tồn tại!'
      });
      return;
    }

    //Validate the new values on model
    teacher.email = teacher_email;
    teacher.name = teacher_name;
    teacher.dob = teacher_dob;
    teacher.phone = teacher_phone;
    const errors = await validate(teacher);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }

    //Try to safe, if fails, that means username already in use
    try {
      await teacherRepository.save(teacher);
    } catch (e) {
      res.status(409).send({
        error: true,
        code: 409,
        message: 'Email hoặc số điện thoại đã tồn tại trên hệ thống!'
      });
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
