import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Parent } from '../entity/Parent';

class ParentController {
  static listAll = async (req: Request, res: Response) => {
    const parentRepository = AppDataSource.getRepository(Parent);
    const parent = await parentRepository.find({
      select: ['id', 'name', 'email', 'dob', 'phone', 'fcmToken']
    });
    res.status(200).send({ error: false, code: 200, data: parent });
  };
  static newParent = async (req: Request, res: Response) => {
    let { id, name, password, email, dob, phone, fcmToken } = req.body;
    let parent = new Parent();
    parent.id = id;
    parent.name = name;
    parent.password = password;
    parent.dob = dob;
    parent.phone = phone;
    parent.email = email;
    parent.fcmToken = fcmToken;

    const errors = await validate(parent);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }

    //Hash the password, to securely store on DB
    parent.hashPassword();
    const parentRepository = AppDataSource.getRepository(Parent);
    try {
      await parentRepository.save(parent);
    } catch (e) {
      console.log(e);
      res.status(409).send({
        error: true,
        code: 409
      });
      return;
    }

    //Try to save. If fails, the username is already in use
    res.status(201).send({
      error: false,
      code: 201,
      message: 'Đăng ký thành công!'
    });
  };
  static editParent = async (req: Request, res: Response) => {
    //Get values from the body
    const { id, name, dob, phone, email } = req.body;

    //Try to find user on database
    const parentRepository = AppDataSource.getRepository(Parent);
    let parent: Parent;
    try {
      parent = await parentRepository.findOneOrFail({
        where: { id }
      });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Phụ Huynh không tồn tại!'
      });
      return;
    }
    //Validate the new values on model
    parent.name = name;
    parent.dob = dob;
    parent.phone = phone;
    parent.email = email;
    const errors = await validate(parent);
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
      await parentRepository.save(parent);
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

  static deleteParent = async (req: Request, res: Response) => {
    const id = req.params.id;
    const parentRepository = AppDataSource.getRepository(Parent);
    let parent: Parent;
    try {
      parent = await parentRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin Phụ Huynh'
      });
      return;
    }
    parentRepository.delete(id);
    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
  static changePassword = async (req: Request, res: Response) => {
    const id = req.params.id;
    let { old_password, new_password } = req.body;
    if (!(old_password && new_password)) {
      res.status(400).send();
    }
    const parentRepository = AppDataSource.getRepository(Parent);
    let parent: Parent;
    try {
      parent = await parentRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin Phụ Huynh'
      });
      return;
    }

    //Check if old password matchs
    if (!parent.checkIfUnencryptedPasswordIsValid(old_password)) {
      res.status(401).send();
      return;
    }
    //Validate de model (password lenght)
    parent.password = new_password;
    const errors = await validate(parent);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    //Hash the new password and save
    parent.hashPassword();
    parentRepository.save(parent);
    res.status(204).send();
  };
  static loginByPhone = async (req: Request, res: Response) => {
    let { phone, password } = req.body;
    if (!(phone && password)) {
      res.status(400).send();
    }
    const parentRepository = AppDataSource.getRepository(Parent);
    let parent: Parent;
    try {
      parent = await parentRepository.findOneOrFail({
        where: { phone }
      });
    } catch (error) {
      res.status(404).send({
        code: 404,
        error: true,
        message: 'Login fail'
      });
      return;
    }

    if (!parent.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).send();
      return;
    }
    res.send({
      error: false,
      code: 200,
      data: parent
    });
  };

  static getOneByEmail = async (req: Request, res: Response) => {
    let email = req.params.email;
    const parentRepository = AppDataSource.getRepository(Parent);
    let parent: Parent;
    try {
      parent = await parentRepository.findOneOrFail({
        select: ['id', 'name', 'email', 'dob', 'phone', 'fcmToken'],
        where: { email }
      });
      res.status(202).send({ error: false, data: parent });
    } catch (error) {
      res.status(404).send();
      return;
    }
  };
}

export default ParentController;
