import multer from "multer";

// 🚀 Use memory storage (NO disk I/O)
const storage = multer.memoryStorage();

// File filter (security)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG/PNG images are allowed"), false);
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB is enough for face images
  }
});
