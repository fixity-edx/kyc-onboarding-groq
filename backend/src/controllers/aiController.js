import KycSubmission from "../models/KycSubmission.js";
import { onboardingGuide } from "../services/groqService.js";

export async function guide(req, res, next){
  try{
    const { question } = req.body;
    if(!question || question.trim().length < 3){
      res.status(400);
      throw new Error("Question too short");
    }

    const kyc = await KycSubmission.findOne({ user: req.user._id });
    const stage = kyc?.stage || "profile";

    const answer = await onboardingGuide({ stage, question });
    res.json({ stage, answer });
  }catch(err){ next(err); }
}
