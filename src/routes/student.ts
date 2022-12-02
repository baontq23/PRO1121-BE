import { Router } from 'express';
import StudentController from '../controllers/StudentController';

const router = Router();

//Create a new Student
router.post('/', StudentController.newStudent);

//Edit one Student
router.patch('/', StudentController.editStudent);

//Delete one Student
router.delete('/:id([a-zA-Z0-9-]+)', StudentController.deleteStudent);

//get one by id
router.get(
  '/:id([a-zA-Z0-9-]+)/:classId([0-9]+)',
  StudentController.getOneById
);

router.get(
  '/parent/:parentId([a-zA-Z0-9-]+)',
  StudentController.getListStudentByParentId
);

router.post('/import', StudentController.importListData);

export default router;
