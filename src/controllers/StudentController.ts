import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { ClassStudent } from '../entity/ClassStudent';
import { Parent } from '../entity/Parent';
import { Student } from '../entity/Student';

export class StudentController {
  static newStudent = async (req: Request, res: Response) => {
    let { id, name, gender, dob, parentId } = req.body;
    let student = new Student();
    student.id = id;
    student.name = name;
    student.dob = dob;
    student.gender = gender;
    student.parentId = parentId;

    const errors = await validate(student);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }
    const studentRepository = AppDataSource.getRepository(Student);
    try {
      await studentRepository.save(student);
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
    const studentRepository = AppDataSource.getRepository(Student);
    const student = await studentRepository.find({
      select: ['id', 'name', 'gender', 'dob', 'parentId']
    });
    res.status(200).send({ error: false, data: student });
  };
  static editStudent = async (req: Request, res: Response) => {
    //Get values from the body
    const { id, name, dob, gender, parentId } = req.body;

    //Try to find user on database
    const studentRepository = AppDataSource.getRepository(Student);
    let student: Student;
    try {
      student = await studentRepository.findOneOrFail({
        where: { id }
      });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Học Sinh không tồn tại!'
      });
      return;
    }
    //Validate the new values on model
    student.name = name;
    student.dob = dob;
    student.gender = gender;
    student.parentId = parentId;
    const errors = await validate(student);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }
    await studentRepository.save(student);
    res.status(204).send({ Error: false, Code: 204 });
  };

  static deleteStudent = async (req: Request, res: Response) => {
    const id = req.params.id;
    const studentRepository = AppDataSource.getRepository(Student);
    let student: Student;
    try {
      student = await studentRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin Học Sinh'
      });
      return;
    }
    studentRepository.delete(id);
    //After all send a 204 (no content, but accepted) response
    res.status(204).send({ error: false, code: 204 });
  };

  static getOneById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const studentRepository = AppDataSource.getRepository(Student);
    let student: Student;
    try {
      student = await studentRepository.findOneOrFail({
        where: { id },
        select: ['id', 'name', 'gender', 'dob', 'parentId']
      });
      res.status(200).send({ error: false, data: student, code: 200 });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin Học Sinh'
      });
      return;
    }
  };

  static getListStudentByParentId = async (req: Request, res: Response) => {
    const parentId = req.params.parentId;
    const studentRepository = AppDataSource.getRepository(Student);
    try {
      const students = await studentRepository.find({
        where: { parentId: { id: parentId } },
        select: ['id', 'name', 'gender', 'dob', 'parentId']
      });
      res.status(200).send({ error: false, code: 200, data: students });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin Học Sinh'
      });
      return;
    }
  };
  static importListData = async (req: Request, res: Response) => {
    const parentRepository = AppDataSource.getRepository(Parent);
    const studentRepository = AppDataSource.getRepository(Student);
    const studentDetailRepository = AppDataSource.getRepository(ClassStudent);
    const students = req.body.students;
    const classroomId = req.body.classroom_id;
    let parents = req.body.parents;
    const parentList = await parentRepository.find();
    if (parentList.length !== 0) {
      parents = parents.filter(
        (item, index: number) => item.phone !== parentList[index].phone
      );
    }
    const studentArr = [];
    students.forEach(item => {
      let student = new Student();
      student.id = item.id;
      student.dob = item.dob;
      student.name = item.name;
      student.gender = item.gender;
      student.parentId = item.parent_id;
      studentArr.push(student);
    });
    const arrs = [];
    parents.forEach(async item => {
      let parent = new Parent();
      parent.id = item.id;
      parent.name = item.name;
      parent.phone = item.phone;
      parent.password = '1234546';
      parent.hashPassword();
      arrs.push(parent);
    });
    const studentDetailArr = [];
    studentArr.forEach(item => {
      for (let i = 1; i <= 2; i++) {
        let studentDetail = new ClassStudent();
        studentDetail.classroomId = classroomId;
        studentDetail.studentId = item.id;
        studentDetail.semester = i;
        studentDetailArr.push(studentDetail);
      }
    });
    try {
      const parentInsertResult = await parentRepository.save(arrs);
      const studentInsertResult = await studentRepository.save(studentArr);
      const studentDetailResult = await studentDetailRepository.save(
        studentDetailArr
      );
      res.status(201).send({
        error: false,
        parentInserted: parentInsertResult.length,
        studentInserted: studentInsertResult.length,
        stdInserted: studentDetailResult.length
      });
    } catch (error) {
      console.log(error);
      res.status(500).send();
      return;
    }
  };
}

export default StudentController;
