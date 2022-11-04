import { Router } from 'express';
import TeacherController from '../controllers/TeacherController';

const router = Router();

//Get all teachers
router.get('/', TeacherController.listAll);

// Get one user
router.get('/:id([0-9]+)', TeacherController.getOneById);
router.get('/login/:email', TeacherController.getOneByEmail);

//Create a new user
router.post('/', TeacherController.newTeacher);

//Edit one user
router.patch('/', TeacherController.editUser);

//Delete one user
router.delete('/:id([0-9]+)', TeacherController.deleteUser);

export default router;
