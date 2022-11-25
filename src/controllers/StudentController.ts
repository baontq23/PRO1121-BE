import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { ClassStudent } from '../entity/ClassStudent';
import { Parent } from '../entity/Parent';
import { Student } from '../entity/Student';
interface parentObj {
  parent_id: string;
  parent_name: string;
  parent_phone: string;
}
interface studentObj {
  id: string;
  name: string;
  parent_id: any;
  parent_phone?: string;
  dob: string;
  gender: string;
}
interface studentScore {
  regular_score_1: number;
  regular_score_2: number;
  regular_score_3: number;
  midterm_score: number;
  final_score: number;
  semester: number;
}
interface studentDetail extends studentScore {
  id: number;
  classroom_id: any;
  student_id: any;
}
export class StudentController {
  static newStudent = async (req: Request, res: Response) => {
    const studentRepository = AppDataSource.getRepository(Student);
    const studentDetailRepository = AppDataSource.getRepository(ClassStudent);
    const studentList = await studentRepository.find();
    const { id, name, gender, dob, parent_id, classroom_id, scores } = req.body;
    const studentTemp = studentList.filter(item => {
      return name === item.name && dob === item.dob;
    });
    let student = new Student();
    if (studentTemp.length === 0) {
      student.id = id;
      student.name = name;
      student.dob = dob;
      student.gender = gender;
      student.parentId = parent_id;

      const errors = await validate(student);
      if (errors.length > 0) {
        res.status(400).send({
          error: true,
          code: 400,
          message: errors[0].constraints
        });
        return;
      }
    } else {
      student = studentTemp[0];
    }
    const studentDetailArr = [];
    for (let i = 1; i <= 2; i++) {
      const studentDetail = new ClassStudent();
      studentDetail.classroomId = classroom_id;
      studentDetail.studentId = student;
      studentDetail.semester = i;
      scores.forEach((s: studentScore) => {
        if (s.semester === i) {
          studentDetail.regularScore1 = s.regular_score_1;
          studentDetail.regularScore2 = s.regular_score_2;
          studentDetail.regularScore3 = s.regular_score_3;
          studentDetail.midtermScore = s.midterm_score;
          studentDetail.finalScore = s.final_score;
        }
      });
      studentDetailArr.push(studentDetail);
    }
    try {
      await studentRepository.save(student);
      await studentDetailRepository.save(studentDetailArr);
    } catch (e) {
      console.log(e);
      res.status(500).send({
        error: true,
        code: 500,
        message: 'Server error'
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
    const studentData: studentObj = req.body.student;
    const studentScore = req.body.scores;
    const studentDetailRepository = AppDataSource.getRepository(ClassStudent);
    const studentRepository = AppDataSource.getRepository(Student);
    const scoreUpdate = [];
    studentScore.forEach((item: studentDetail) => {
      const score = new ClassStudent();
      score.id = item.id;
      score.classroomId = item.classroom_id;
      score.studentId = item.student_id;
      score.regularScore1 = item.regular_score_1 ? item.regular_score_1 : null;
      score.regularScore2 = item.regular_score_2 ? item.regular_score_2 : null;
      score.regularScore3 = item.regular_score_3 ? item.regular_score_3 : null;
      score.midtermScore = item.midterm_score ? item.midterm_score : null;
      score.finalScore = item.midterm_score ? item.midterm_score : null;
      score.semester = item.semester;
      scoreUpdate.push(score);
    });
    let student: Student;
    try {
      student = await studentRepository.findOneOrFail({
        where: { id: studentData.id }
      });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Học sinh không tồn tại!'
      });
      return;
    }
    //Validate the new values on model
    student.name = studentData.name;
    student.dob = studentData.dob;
    student.gender = studentData.gender;
    student.parentId = studentData.parent_id;
    const errors = await validate(student);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }
    try {
      await studentRepository.save(student);
      await studentDetailRepository.save(scoreUpdate);
      res.status(204).send();
    } catch (e) {
      console.log(e);
      res.status(500).send({
        error: true,
        code: 500,
        message: 'Server error!'
      });
    }
  };

  static deleteStudent = async (req: Request, res: Response) => {
    const id = req.params.id;
    const studentRepository = AppDataSource.getRepository(Student);
    try {
      await studentRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin học sinh'
      });
      return;
    }
    studentRepository
      .delete(id)
      .then(() => {
        res.status(204).send();
      })
      .catch(e => {
        console.log(e);
        res.status(500).send({
          error: true,
          code: 500,
          message: 'Server error'
        });
      });
  };

  static getOneById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const classId = parseInt(req.params.classId);
    const studentRepository = AppDataSource.getRepository(Student);
    const studentDetailRepository = AppDataSource.getRepository(ClassStudent);

    try {
      const student = await studentRepository.findOneOrFail({
        where: { id },
        select: ['id', 'name', 'gender', 'dob', 'parentId']
      });
      const scoreDetail = await studentDetailRepository.find({
        where: { studentId: { id }, classroomId: { id: classId } },
        loadRelationIds: true
      });
      res.status(200).send({
        error: false,
        data: { student, scores: scoreDetail }
      });
    } catch (error) {
      console.log(error);
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin học sinh'
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
        message: 'Không tìm thấy thông tin học sinh'
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
    const parents = req.body.parents;
    const studentList = await studentRepository.find();
    const parentList = await parentRepository.find();
    const studentArr = [];
    students.forEach((item: studentObj) => {
      const studentTmp = studentList.filter(item2 => {
        return item.name === item2.name && item.dob === item2.dob;
      });
      if (studentTmp.length === 0) {
        const student = new Student();
        student.id = item.id;
        student.dob = item.dob;
        student.name = item.name;
        student.gender = item.gender;
        const parentTmpId = parentList.filter(
          p => p.phone === item.parent_phone
        );
        if (parentTmpId.length === 0) {
          student.parentId = item.parent_id;
        } else {
          student.parentId = parentTmpId[0];
        }
        studentArr.push(student);
      } else {
        studentArr.push(studentTmp[0]);
      }
    });
    const parentArr = [];
    parents.forEach(async (item: parentObj) => {
      if (parentList.findIndex(o => o.phone === item.parent_phone) === -1) {
        const parent = new Parent();
        parent.id = item.parent_id;
        parent.name = item.parent_name;
        parent.phone = item.parent_phone;
        parent.password = '1234546';
        parent.hashPassword();
        parentArr.push(parent);
      }
    });
    const studentDetailArr = [];
    studentArr.forEach(item => {
      for (let i = 1; i <= 2; i++) {
        const studentDetail = new ClassStudent();
        studentDetail.classroomId = classroomId;
        studentDetail.studentId = item.id;
        studentDetail.semester = i;
        studentDetailArr.push(studentDetail);
      }
    });
    try {
      const parentInsertResult = await parentRepository.save(parentArr);
      const studentInsertResult = await studentRepository.save(studentArr);
      const studentDetailResult = await studentDetailRepository.save(
        studentDetailArr
      );
      res.status(201).send({
        error: false,
        code: 201,
        parentInserted: parentInsertResult.length,
        studentInserted: studentInsertResult.length,
        stdInserted: studentDetailResult.length
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        error: true,
        code: 500,
        message: 'Server error!'
      });
      return;
    }
  };
}

export default StudentController;
