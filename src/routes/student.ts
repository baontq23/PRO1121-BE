import { Router } from "express";
import StudentController from '../controllers/StudentController';

const router = Router();

//Get all Student
router.get('/', StudentController.listAll);

//Create a new Student
router.post('/', StudentController.newStudent);

//Edit one Student
router.patch('/', StudentController.editStudent);

//Delete one Student
router.delete('/:id([0-9]+)', StudentController.deleteStudent);

//get one by id
router.get('/:id([0-9]+)', StudentController.getOneById);

router.get('/parentId/:parentId([0-9]+)', StudentController.getListStudentByParentId);


export default router;

