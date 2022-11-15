import { Router } from 'express';
import FeedbackController from '../controllers/FeedbackController';

const router = Router();

//Get all
router.get('/', FeedbackController.listAll);

//Get one by id
router.get('/:id([0-9]+)', FeedbackController.getOneById);

//Get all by studentId
router.get(
  '/studentId/:studentId([a-zA-Z0-9-]+)',
  FeedbackController.getAllByStudentId
);

//Create a new feedback
router.post('/', FeedbackController.newFeedback);

//Edit
router.patch('/', FeedbackController.editFeedback);

//Delete
router.delete('/:id([0-9]+)', FeedbackController.deleteFeedback);

export default router;
