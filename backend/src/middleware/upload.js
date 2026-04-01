import multer from "multer";
import path from "path";
import fs from "fs";

const dir = "uploads";
if(!fs.existsSync(dir)) fs.mkdirSync(dir);

const storage = multer.diskStorage({
  destination: function(req,file,cb){ cb(null, dir); },
  filename: function(req,file,cb){
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
