import { Router } from "express";
import multer from "multer";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

const uploadRouter = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

uploadRouter.post(
  "/",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image",
        });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "InstaCart/products",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        Readable.from(req.file!.buffer).pipe(stream);
      });

      return res.status(200).json({
        success: true,
        image: result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Upload failed",
      });
    }
  }
);

export default uploadRouter;