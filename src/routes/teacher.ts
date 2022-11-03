import { Router } from 'express';
import TeacherController from '../controllers/TeacherController';

const router = Router();

//Get all teachers
router.get('/', TeacherController.listAll);

// Get one user
router.get('/:id([0-9]+)', TeacherController.getOneById);

//Create a new user
router.post('/', TeacherController.newUser);

//Edit one user
router.patch('/', TeacherController.editUser);

//Delete one user
router.delete('/:id([0-9]+)', TeacherController.deleteUser);

export default router;
