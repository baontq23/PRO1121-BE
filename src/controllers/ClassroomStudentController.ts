import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { ClassStudent } from '../entity/ClassStudent';

class ClassroomController {
  static listAll = async (req: Request, res: Response) => {
    const classStudentRepository = AppDataSource.getRepository(ClassStudent);
    const classStudent = await classStudentRepository.find({
      select: [
        'id',
        'classroomId',
        'studentId',
        'regularScore1',
        'regularScore2',
        'regularScore3',
        'midtermScore',
        'finalScore',
        'semester'
      ]
    });
    res.status(200).send({ error: false, code: 200, data: classStudent });
  };

  static getAcademicTranscriptById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let academictranscript = await queryRunner.manager.query('SELECT * FROM tbl_class_students INNER JOIN tbl_students  ON tbl_class_students.student_id = tbl_students.id WHERE tbl_students.id = "' + id + '"')
      res.status(200).send({ error: false, data: { academictranscript } });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Học sinh không tồn tại!'
      });
      return;
    }

  }

  static newClassStudent = async (req: Request, res: Response) => {
    let {
      classroom_Id,
      student_Id,
      regularScore1,
      regularScore2,
      regularScore3,
      midtermScore,
      finalScore,
      semester
    } = req.body;
    let classStudent = new ClassStudent();
    classStudent.classroomId = classroom_Id;
    classStudent.studentId = student_Id;
    classStudent.regularScore1 = regularScore1;
    classStudent.regularScore2 = regularScore2;
    classStudent.regularScore3 = regularScore3;
    classStudent.midtermScore = midtermScore;
    classStudent.finalScore = finalScore;
    classStudent.semester = semester;

    const errors = await validate(ClassStudent);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }
    const classStudentRepository = AppDataSource.getRepository(ClassStudent);
    try {
      await classStudentRepository.save(classStudent);
    } catch (e) {
      console.log(e);
      res.status(500).send({
        error: true,
        code: 500,
        message: 'server error'
      });
      return;
    }
    res.status(201).send({
      error: false,
      code: 201,
      message: 'Tạo thành công!'
    });
  };

  static editClassStudent = async (req: Request, res: Response) => {
    //Get values from the body
    const {
      id,
      studentId,
      classroomId,
      regularScore1,
      regularScore2,
      regularScore3,
      midtermScore,
      finalScore,
      semester
    } = req.body;

    const classStudentRepository = AppDataSource.getRepository(ClassStudent);
    let classStudent: ClassStudent;
    try {
      classStudent = await classStudentRepository.findOneOrFail({
        where: { id }
      });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Class Student không tồn tại!'
      });
      return;
    }
    //Validate the new values on model
    classStudent.classroomId = classroomId;
    classStudent.studentId = studentId;
    classStudent.regularScore1 = regularScore1;
    classStudent.regularScore2 = regularScore2;
    classStudent.regularScore3 = regularScore3;
    classStudent.midtermScore = midtermScore;
    classStudent.finalScore = finalScore;
    classStudent.semester = semester;
    const errors = await validate(classStudent);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }
    try {
      await classStudentRepository.save(classStudent);
    } catch (e) {
      res.status(500).send({
        error: true,
        code: 500,
        message: 'Server Error!'
      });
      return;
    }
    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  static deleteClassStudent = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const classStudentRepository = AppDataSource.getRepository(ClassStudent);
    try {
      const classStudent = await classStudentRepository.findOneOrFail({
        where: { id }
      });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin Lớp'
      });
      return;
    }
    classStudentRepository.delete(id);
    res.status(204).send();
  };

  static importScore = async (req: Request, res: Response) => {
    const scoreData = req.body.students_scores;
    const classStudentRepository = AppDataSource.getRepository(ClassStudent);
    const scoreArr = [];
    scoreData.forEach(item => {
      let score = new ClassStudent();
      score.id = item.id;
      score.classroomId = item.classroom_id;
      score.studentId = item.student_id;
      score.regularScore1 = item.regular_score_1;
      score.regularScore2 = item.regular_score_2;
      score.regularScore3 = item.regular_score_3;
      score.midtermScore = item.midterm_score;
      score.finalScore = item.final_score;
      score.semester = item.semester;
      scoreArr.push(score);
    });
    classStudentRepository
      .save(scoreArr)
      .then(result => {
        res.send({
          error: false,
          dataChange: result.length
        });
      })
      .catch(e => {
        console.log(e);
        res.status(500).send();
      });
  };
}
export default ClassroomController;
