import { Router } from 'express';
import auth from './auth';
import teacher from './teacher';
import classroom from './classroom';
import classuser from './classuser';
import feedback from './feedback';
import parent from './parent';
import student from './student';

const routes = Router();

routes.use('/auth', auth);
routes.use('/teacher', teacher);
routes.use('/classroom', classroom);
routes.use('/classuser', classuser);
routes.use('/feedback', feedback);
routes.use('/parent', parent);
routes.use('/student', student);

export default routes;
