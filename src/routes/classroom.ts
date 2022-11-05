import { Router } from "express";
import ClassroomController from '../controllers/ClassroomController';
const router = Router();

//Get all ClassRoom
router.get('/', ClassroomController.listAll);

//Create a new ClassRoom
router.post('/', ClassroomController.newClassroom);

//Edit one ClassRoom
router.patch('/', ClassroomController.editClassRoom);

//Delete one ClassRoom
router.delete('/:id([0-9]+)', ClassroomController.deleteClassRoom);

//get listClass by Id_teacher
router.get('/teacherId/:teacherId([0-9]+)', ClassroomController.getListClassRoomtByTeacherId);

export default router;
