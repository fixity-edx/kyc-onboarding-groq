import KycSubmission from "../models/KycSubmission.js";
import { sendEmail } from "../services/resendService.js";

export async function getMyKyc(req, res, next){
  try{
    const doc = await KycSubmission.findOne({ user: req.user._id }).populate("user", "name email");
    res.json(doc || { stage: "profile", finalStatus: "pending", documents: [] });
  }catch(err){ next(err); }
}

export async function listAll(req, res, next){
  try{
    const docs = await KycSubmission.find().populate("user", "name email").sort({ updatedAt: -1 });
    res.json(docs);
  }catch(err){ next(err); }
}

export async function uploadDocument(req, res, next){
  try{
    const { docType } = req.body;
    if(!req.file){ res.status(400); throw new Error("File missing"); }

    const kyc = await KycSubmission.findOne({ user: req.user._id });
    if(!kyc){ res.status(404); throw new Error("KYC not found"); }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    kyc.documents.push({
      docType,
      fileName: req.file.originalname,
      fileUrl,
      uploadedAt: new Date(),
    });

    // stage update
    if(kyc.stage === "profile") kyc.stage = "documents";
    if(kyc.documents.length >= 2) kyc.stage = "review"; // basic rule
    kyc.finalStatus = "pending";
    await kyc.save();

    res.status(201).json({ message: "Uploaded", kyc });
  }catch(err){ next(err); }
}

export async function makeDecision(req, res, next){
  try{
    const { id } = req.params;
    const { decision, reason } = req.body; // approved/rejected

    const kyc = await KycSubmission.findById(id).populate("user", "email name");
    if(!kyc){ res.status(404); throw new Error("Submission not found"); }

    kyc.stage = "decision";
    kyc.finalStatus = decision;
    kyc.rejectionReason = decision === "rejected" ? (reason || "Not specified") : "";
    kyc.verifiedBy = req.user._id;
    kyc.verifiedAt = new Date();

    await kyc.save();

    await sendEmail({
      to: kyc.user.email,
      subject: `KYC ${decision.toUpperCase()}`,
      html: decision === "approved"
        ? `<p>Hello ${kyc.user.name}, your KYC has been <b>approved</b>.</p>`
        : `<p>Hello ${kyc.user.name}, your KYC has been <b>rejected</b>. Reason: ${kyc.rejectionReason}</p>`
    }).catch(()=>{});

    res.json(kyc);
  }catch(err){ next(err); }
}
