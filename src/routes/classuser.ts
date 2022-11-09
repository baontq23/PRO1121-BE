import { Router } from "express";
import ClassroomStudentController from '../controllers/ClassroomStudentController';
const router = Router();

//Get all ClassRoomStudent
router.get('/', ClassroomStudentController.listAll);

//Create a new ClassRoomStudent
router.post('/', ClassroomStudentController.newClassStudent);

//Edit one ClassRoomStudent
router.patch('/', ClassroomStudentController.editClassStudent);

//Delete one ClassRoomStudent
router.delete('/:id([0-9]+)', ClassroomStudentController.deleteClassStudent);

//get Academic Transcript By Id
router.get('/:id([a-zA-Z0-9]+)', ClassroomStudentController.getAcademicTranscriptById);

//Import score data from file
router.patch('/score/import', ClassroomStudentController.importScore);
export default router;
