import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)//keeping original name of file operation for very short time on server before uploading to cloudinary
  }
})


export const upload=multer({storage} )