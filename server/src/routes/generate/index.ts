import { Router } from "express";
import { sarlRoute } from "./sarl";
import { sarluRoute } from "./sarlu";
import { saAgRoute } from "./sa-ag";
import { saUniRoute } from "./sa-uni";
import { saCaRoute } from "./sa-ca";
import { sasuRoute } from "./sasu";
import { sasRoute } from "./sas";
import { gieRoute } from "./gie";
import { stePartRoute } from "./ste-part";
import { drcRoute } from "./drc";

export const generateRoutes = Router();

generateRoutes.use(sarlRoute);
generateRoutes.use(sarluRoute);
generateRoutes.use(saAgRoute);
generateRoutes.use(saUniRoute);
generateRoutes.use(saCaRoute);
generateRoutes.use(sasuRoute);
generateRoutes.use(sasRoute);
generateRoutes.use(gieRoute);
generateRoutes.use(stePartRoute);
generateRoutes.use(drcRoute);
