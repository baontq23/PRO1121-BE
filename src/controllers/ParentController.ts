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
    const { parent_id, parent_name, parent_email, parent_dob, parent_phone } =
      req.body;
    const parent = new Parent();
    parent.id = parent_id;
    parent.name = parent_name;
    parent.password = '123456';
    parent.dob = parent_dob;
    parent.phone = parent_phone;
    parent.email = parent_email ? parent_email : null;

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
        code: 409,
        message: 'Số điện thoại đã tồn tại trên hệ thống!'
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
  static resetPassword = async (req: Request, res: Response) => {
    const id = req.params.id;
    const parentRepository = AppDataSource.getRepository(Parent);
    let parent: Parent;
    try {
      parent = await parentRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin phụ huynh'
      });
      return;
    }
    parent.password = '123456';
    parent.hashPassword();
    await parentRepository.save(parent);
    res.status(204).send();
  };

  static editParent = async (req: Request, res: Response) => {
    //Get values from the body
    const {
      parent_id,
      parent_name,
      parent_email,
      parent_dob,
      parent_phone,
      parent_fcmtoken
    } = req.body;

    //Try to find user on database
    const parentRepository = AppDataSource.getRepository(Parent);
    let parent: Parent;
    try {
      parent = await parentRepository.findOneOrFail({
        where: { id: parent_id }
      });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Phụ huynh không tồn tại!'
      });
      return;
    }
    //Validate the new values on model
    parent.name = parent_name;
    parent.dob = parent_dob ? parent_dob : null;
    parent.phone = parent_phone;
    parent.email = parent_email ? parent_email : null;
    parent.fcmToken = parent_fcmtoken;
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

    try {
      await parentRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin phụ huynh!'
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
        message: 'Không tìm thấy thông tin phụ huynh'
      });
      return;
    }

    //Check if old password matches
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
    const { phone, password } = req.body;
    if (!(phone && password)) {
      res.status(400).send();
    }
    const parentRepository = AppDataSource.getRepository(Parent);
    const parent = new Parent();
    try {
      const rawParent = await parentRepository
        .createQueryBuilder('parent')
        .select([
          'parent.id AS parent_id',
          'parent.name AS parent_name',
          'parent.password AS parent_password',
          'parent.dob AS parent_dob',
          'parent.phone AS parent_phone',
          'parent.fcmToken AS parent_fcmtoken'
        ])
        .where('parent.phone = :phone', { phone })
        .getRawOne();
      parent.password = rawParent.parent_password;
      if (!parent.checkIfUnencryptedPasswordIsValid(password)) {
        res.status(401).send({
          code: 401,
          error: true,
          message: 'Sai mật khẩu!'
        });
        return;
      }
      res.send({
        error: false,
        code: 200,
        data: rawParent
      });
    } catch (error) {
      console.log(error);
      res.status(404).send({
        code: 404,
        error: true,
        message: 'Số điện thoại không tồn tại trên hệ thống!'
      });
      return;
    }
  };

  static getOneByEmail = async (req: Request, res: Response) => {
    const email = req.params.email;
    const queryRunner = AppDataSource.manager;
    const getInformation = await queryRunner.query(
      'SELECT tbl_parents.id AS parent_id,tbl_parents.name AS parent_name,tbl_parents.email AS parent_email,tbl_parents.dob AS parent_dob, tbl_parents.phone AS parent_phone,tbl_parents.fcmToken AS parent_fcmtoken FROM tbl_parents WHERE tbl_parents.email = "' +
        email +
        '"'
    );
    if (getInformation.length === 0) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Phụ huynh không tồn tại !'
      });
    } else {
      res.status(200).send({ error: false, data: getInformation });
    }
  };
  static getListParentByClassroomID = async (req: Request, res: Response) => {
    const idClassroom = parseInt(req.params.idClassroom);
    const queryRunner = AppDataSource.manager;
    const getAllInformation = await queryRunner.query(
      'SELECT tbl_parents.id AS parent_id ,tbl_parents.name AS parent_name,tbl_parents.email AS parent_email,tbl_parents.dob AS parent_dob, tbl_parents.phone AS parent_phone, tbl_parents.fcmToken AS parent_fcmtoken, tbl_students.id AS student_id , tbl_students.name AS student_name FROM tbl_parents INNER JOIN tbl_students ON tbl_parents.id = tbl_students.parent_id INNER JOIN tbl_class_students ON tbl_students.id = tbl_class_students.student_id INNER JOIN tbl_classrooms ON tbl_classrooms.id = tbl_class_students.classroom_id WHERE tbl_class_students.semester = 1 AND tbl_classrooms.id = "' +
        idClassroom +
        '"'
    );
    if (getAllInformation.length === 0) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Lớp học không tồn tại !'
      });
    } else {
      res.status(200).send({ error: false, data: getAllInformation });
    }
  };

  static getParentByPhone = async (req: Request, res: Response) => {
    const phone = req.params.phone;
    const parentRepository = AppDataSource.getRepository(Parent);
    try {
      let parent = await parentRepository.findOneOrFail({
        select: ['id', 'name', 'email', 'dob', 'phone', 'fcmToken'],
        where: { phone }
      });
      for (let key in parent) {
        parent['parent_' + key] = parent[key];
        delete parent[key];
      }
      res.send({ error: false, code: 200, data: parent });
    } catch (error) {
      res.status(404).send();
      return;
    }
  };
  static gradeOfTheSubject = async (req: Request, res: Response) => {
    const idStudent = req.params.id;
    const queryRunner = AppDataSource.manager;
    const gradeOfTheSubject = await queryRunner.query(
      'SELECT tbl_classrooms.name AS classroom_name, tbl_classrooms.id AS classroom_id, tbl_classrooms.subject AS classroom_subject, tbl_class_students.regularScore1 AS regular_score_1, tbl_class_students.regularScore2 AS regular_score_2, tbl_class_students.regularScore3 AS regular_score_3, tbl_class_students.midtermScore AS midterm_score ,tbl_class_students.finalScore AS final_score, tbl_class_students.semester FROM tbl_students JOIN tbl_class_students on tbl_class_students.student_id = tbl_students.id JOIN tbl_classrooms ON tbl_classrooms.id = tbl_class_students.classroom_id JOIN tbl_teachers ON tbl_teachers.id = tbl_classrooms.teacher_id WHERE tbl_students.id =  "' +
        idStudent +
        '"'
    );
    if (gradeOfTheSubject.length === 0) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Học sinh chưa tham gia lớp nào !'
      });
    } else {
      res.status(200).send({ error: false, data: gradeOfTheSubject });
    }
  };
  static gradeSubjectByClass = async (req: Request, res: Response) => {
    const idStudent = req.params.id;
    const classId = req.params.classId;
    const queryRunner = AppDataSource.manager;
    const gradeOfTheSubject = await queryRunner.query(
      'SELECT tbl_classrooms.name AS classroom_name, tbl_classrooms.subject AS classroom_subject, tbl_teachers.name AS teacher_name, tbl_teachers.phone AS teacher_phone, tbl_students.name AS student_name,tbl_students.gender AS student_gender, tbl_students.dob AS student_dob, tbl_class_students.regularScore1 AS regular_score_1, tbl_class_students.regularScore2 AS regular_score_2, tbl_class_students.regularScore3 AS regular_score_3, tbl_class_students.midtermScore AS midterm_score ,tbl_class_students.finalScore AS final_score , tbl_class_students.semester FROM tbl_students JOIN tbl_class_students on tbl_class_students.student_id = tbl_students.id JOIN tbl_classrooms ON tbl_classrooms.id = tbl_class_students.classroom_id JOIN tbl_teachers ON tbl_teachers.id = tbl_classrooms.teacher_id WHERE tbl_students.id =  "' +
        idStudent +
        '" AND tbl_classrooms.id = ' +
        classId
    );
    if (gradeOfTheSubject.length === 0) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không có bản ghi nào !'
      });
    } else {
      res.status(200).send({ error: false, data: gradeOfTheSubject });
    }
  };
}

export default ParentController;
