import { Router } from 'express';
import FeedbackController from '../controllers/FeedbackController';

const router = Router();

//Get one by id
router.get('/:id([0-9]+)', FeedbackController.getOneById);

//Get all by studentId
router.get(
  '/student/:studentId([a-zA-Z0-9-]+)',
  FeedbackController.getAllByStudentId
);

//Create a new feedback
router.post('/', FeedbackController.newFeedback);

//Create multi feedback
router.post('/multi', FeedbackController.newMultiFeedback);

//Edit
router.patch('/', FeedbackController.editFeedback);

//Delete
router.delete('/:id([0-9]+)', FeedbackController.deleteFeedback);

//getAllByClassRoomId
router.get(
  'student/class/:studentId([a-zA-Z0-9-]+)/:classRoomId([0-9])+',
  FeedbackController.getAllByClassRoomId
);

//getAllByParentId
router.get(
  '/parent/:parentId([a-zA-Z0-9-]+)',
  FeedbackController.getAllByParentId
);

export default router;
