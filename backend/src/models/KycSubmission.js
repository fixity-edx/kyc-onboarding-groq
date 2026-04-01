import mongoose from "mongoose";

const docSchema = new mongoose.Schema(
  {
    docType: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    stage: { type: String, enum: ["profile","documents","review","decision"], default: "profile" },
    finalStatus: { type: String, enum: ["pending","approved","rejected"], default: "pending" },

    documents: { type: [docSchema], default: [] },

    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("KycSubmission", kycSchema);
