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
        let classStudent: ClassStudent;
        try {
            classStudent = await classStudentRepository.findOneOrFail({
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
}
export default ClassroomController;
