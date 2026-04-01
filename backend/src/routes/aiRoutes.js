import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { guideRules } from "../validators/aiValidators.js";
import { guide } from "../controllers/aiController.js";

const router = Router();

router.post("/guide", protect, guideRules, validate, guide);

export default router;
