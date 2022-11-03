import { Router } from "express";
import auth from "./auth";
import teacher from "./teacher";

const routes = Router();

routes.use("/auth", auth);
routes.use("/teacher", teacher);

export default routes;
