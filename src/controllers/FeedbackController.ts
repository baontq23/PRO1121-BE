import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Feedback } from '../entity/Feedback';

interface FeedbackItem {
  feedback_content: string;
  feedback_date: number;
  teacher_id: number | any;
  student_id: string | any;
}

class FeedbackController {
  static newFeedback = async (req: Request, res: Response) => {
    const { feedback_content, feedback_date, teacher_id, student_id } =
      req.body;
    const feedback = new Feedback();
    feedback.content = feedback_content;
    feedback.date = feedback_date;
    feedback.teacherId = teacher_id;
    feedback.studentId = student_id;

    //Validate
    const errors = await validate(feedback);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }

    //Save
    const feedbackRepository = AppDataSource.getRepository(Feedback);
    try {
      await feedbackRepository.save(feedback);
    } catch (error) {
      res.status(500).send({
        error: true,
        code: 500,
        message: 'Thêm dữ liệu thất bại!'
      });
      return;
    }
    res.status(201).send({
      error: false,
      code: 201,
      message: 'Thêm dữ liệu thành công!'
    });
  };

  static newMultiFeedback = async (req: Request, res: Response) => {
    const feedbacks = req.body.feedbacks;
    const dataIns = [];
    feedbacks.forEach((item: FeedbackItem) => {
      const feedbackItem = new Feedback();
      feedbackItem.content = item.feedback_content;
      feedbackItem.date = item.feedback_date;
      feedbackItem.teacherId = item.teacher_id;
      feedbackItem.studentId = item.student_id;
      dataIns.push(feedbackItem);
    });

    //Save
    const feedbackRepository = AppDataSource.getRepository(Feedback);
    try {
      await feedbackRepository.save(dataIns);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        error: true,
        code: 500,
        message: 'Thêm dữ liệu thất bại!'
      });
      return;
    }
    res.status(201).send({
      error: false,
      code: 201,
      message: 'Thêm dữ liệu thành công!'
    });
  };
  static editFeedback = async (req: Request, res: Response) => {
    const {
      feedback_id,
      feedback_content,
      feedback_date,
      teacher_id,
      student_id
    } = req.body;

    //Try to find id on database
    const feedbackRepository = AppDataSource.getRepository(Feedback);
    let feedback: Feedback;
    try {
      feedback = await feedbackRepository.findOneOrFail({
        where: { id: feedback_id }
      });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Feedback không tồn tại!'
      });
      return;
    }

    //Validate
    feedback.content = feedback_content;
    feedback.date = feedback_date;
    feedback.teacherId = teacher_id;
    feedback.studentId = student_id;
    const errors = await validate(feedback);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
    }

    //Save
    try {
      await feedbackRepository.save(feedback);
    } catch (error) {
      res.status(500).send({
        error: true,
        code: 500,
        message: 'Sửa dữ liệu thất bại!'
      });
      return;
    }
    res.status(201).send({
      error: false,
      code: 201,
      message: 'Sửa dữ liệu thành công!'
    });
  };

  static deleteFeedback = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const feedbackRepository = AppDataSource.getRepository(Feedback);
    try {
      await feedbackRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin feedback!'
      });
      return;
    }
    feedbackRepository
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
    const id: number = parseInt(req.params.id);
    const feedbackRepository = AppDataSource.getRepository(Feedback);
    try {
      const feedback = await feedbackRepository.findOneOrFail({
        select: ['id', 'content', 'date', 'teacherId', 'studentId'],
        where: { id }
      });
      res.send({ error: false, data: feedback });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy feedback nào!'
      });
    }
  };

  static getAllByStudentId = async (req: Request, res: Response) => {
    const student_id = req.params.studentId;
    const feedbackRepository = AppDataSource.getRepository(Feedback);
    try {
      const feedback = await feedbackRepository.find({
        select: ['id', 'content', 'date', 'teacherId', 'studentId'],
        where: { studentId: { id: student_id } }
      });
      res.send({ error: false, data: feedback });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy feedback nào!'
      });
    }
  };

  static getAllByClassRoomId = async (req: Request, res: Response) => {
    const student_id = req.params.studentId;
    const classRoom_id = req.params.classRoomId;
    const queryRunner = AppDataSource.manager;
    const getAllFeedBack = await queryRunner.query(
      "SELECT tbl_feedbacks.content AS feedback_content , tbl_feedbacks.date AS feedback_date  FROM tbl_feedbacks INNER JOIN tbl_students ON tbl_students.id = tbl_feedbacks.student_id INNER JOIN tbl_class_students on tbl_class_students.student_id = tbl_students.id  WHERE tbl_class_students.semester = 1 AND tbl_class_students.classroom_id = '" +
        classRoom_id +
        "' AND tbl_students.id = '" +
        student_id +
        "'"
    );
    if (getAllFeedBack.length === 0) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'feedback không tồn tại !'
      });
    } else {
      res.status(200).send({ error: false, data: getAllFeedBack });
    }
  };

  static getAllByParentId = async (req: Request, res: Response) => {
    const parent_id = req.params.parentId;
    const queryRunner = AppDataSource.manager;
    const getAllFeedBack = await queryRunner.query(
      "SELECT tbl_feedbacks.content AS feedback_content , tbl_feedbacks.date AS feedback_date, tbl_classrooms.name AS classroom_name FROM tbl_feedbacks INNER JOIN tbl_students ON tbl_students.id = tbl_feedbacks.student_id INNER JOIN tbl_parents ON tbl_parents.id = tbl_students.parent_id INNER JOIN tbl_class_students ON tbl_students.id = tbl_class_students.student_id INNER JOIN tbl_classrooms ON tbl_class_students.classroom_id = tbl_classrooms.id WHERE tbl_parents.id = '" +
        parent_id +
        "' AND tbl_class_students.semester = 1"
    );
    if (getAllFeedBack.length === 0) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'feedback không tồn tại !'
      });
    } else {
      res.status(200).send({ error: false, data: getAllFeedBack });
    }
  };
}

export default FeedbackController;
