import { body } from "express-validator";

export const uploadRules = [
  body("docType").trim().isLength({ min: 2 }).withMessage("docType required"),
];

export const decisionRules = [
  body("decision").isIn(["approved","rejected"]).withMessage("Invalid decision"),
  body("reason").optional().trim(),
];
