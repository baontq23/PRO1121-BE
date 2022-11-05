import { Router } from "express";
import ParentController from '../controllers/ParentController';

const router = Router();
//Get all Parents
router.get('/', ParentController.listAll);

//Create a new Parent
router.post('/', ParentController.newParent);

//Edit one Parent
router.patch('/', ParentController.editParent);

//Delete one Parent
router.delete('/:id([0-9]+)', ParentController.deleteParent);

//ChangePassword one Parent
router.patch('/changePassword/:id([0-9]+)', ParentController.changePassword);

//get one by email
router.get('/login/:email', ParentController.getOneByEmail);

//login by phone
router.get('/login', ParentController.loginByPhone);

export default router;
