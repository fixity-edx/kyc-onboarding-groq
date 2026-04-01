import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";
import { uploadRules, decisionRules } from "../validators/kycValidators.js";
import { getMyKyc, listAll, uploadDocument, makeDecision } from "../controllers/kycController.js";

const router = Router();

router.get("/me", protect, getMyKyc);
router.get("/", protect, requireRole("admin"), listAll);

router.post("/upload", protect, requireRole("user"), upload.single("file"), uploadRules, validate, uploadDocument);
router.put("/:id/decision", protect, requireRole("admin"), decisionRules, validate, makeDecision);

export default router;
