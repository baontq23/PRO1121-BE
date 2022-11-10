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

//get Academic Transcript Student By Id ClassRoom
router.get('/:idClass([0-9]+)', ClassroomStudentController.getAcademicTranscriptByIdClassRoom);

//get All Information of Student and Parent
router.get('/getinfo/:id([a-zA-Z0-9-]+)/:idClass([0-9]+)', ClassroomStudentController.getAllInformationParentAndStudent);

//Import score data from file
router.patch('/score/import', ClassroomStudentController.importScore);
export default router;
