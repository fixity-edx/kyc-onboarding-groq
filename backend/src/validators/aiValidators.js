import { body } from "express-validator";

export const guideRules = [
  body("question").trim().isLength({ min: 3 }).withMessage("Question required"),
];
