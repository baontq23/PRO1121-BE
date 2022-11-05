import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Classroom } from '../entity/Classroom';

class ClassroomController {
  static newClassroom = async (req: Request, res: Response) => {
    let { id, name, decription, subject, teacherId } = req.body;
    let classroom = new Classroom();
    classroom.id = id;
    classroom.name = name;
    classroom.decription = decription;
    classroom.subject = subject;
    classroom.teacherId = teacherId;

    const errors = await validate(classroom);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }
    const classRoomRepository = AppDataSource.getRepository(Classroom);
    try {
      await classRoomRepository.save(classroom);
    } catch (e) {
      console.log(e);
      res.status(500).send({
        error: true,
        code: 500,
        message: 'server error'
      });
      return;
    }
    //Try to save. If fails, the username is already in use
    res.status(201).send({
      error: false,
      code: 201,
      message: 'Tạo thành công!'
    });
  };

  static listAll = async (req: Request, res: Response) => {
    const classRoomRepository = AppDataSource.getRepository(Classroom);
    const classroom = await classRoomRepository.find({
      select: ['id', 'name', 'decription', 'subject', 'teacherId']
    });
    res.status(200).send({ error: false, data: classroom });
  };
  static editClassRoom = async (req: Request, res: Response) => {
    //Get values from the body
    const { id, name, decription, subject, teacherId } = req.body;

    //Try to find user on database
    const classRoomRepository = AppDataSource.getRepository(Classroom);
    let classroom: Classroom;
    try {
      classroom = await classRoomRepository.findOneOrFail({
        where: { id }
      });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Lớp không tồn tại!'
      });
      return;
    }
    //Validate the new values on model
    classroom.name = name;
    classroom.decription = decription;
    classroom.subject = subject;
    classroom.teacherId = teacherId;
    const errors = await validate(classroom);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }
    await classRoomRepository.save(classroom);
    res.status(204).send({ Error: false, Code: 204 });
  };

  static deleteClassRoom = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const classRoomRepository = AppDataSource.getRepository(Classroom);
    let classroom: Classroom;
    try {
      classroom = await classRoomRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin lớp'
      });
      return;
    }
    classRoomRepository.delete(id);
    //After all send a 204 (no content, but accepted) response
    res.status(204).send({ error: false, code: 204 });
  };

  static getListClassRoomtByTeacherId = async (req: Request, res: Response) => {
    const teacherId = Number(req.params.teacherId);
    const classRoomRepository = AppDataSource.getRepository(Classroom);
    try {
      const classrooms = await classRoomRepository.find({
        where: { teacherId: { id: teacherId } },
        select: ['id', 'name', 'decription', 'subject', 'teacherId']
      });
      res.status(200).send({ error: false, code: 200, data: classrooms });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin Lớp'
      });
      return;
    }
  };
}

export default ClassroomController;
