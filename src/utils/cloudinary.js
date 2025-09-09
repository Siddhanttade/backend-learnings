import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME ,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary= async (localFilePath)=>{
    try{
        if(!localFilePath) return null // no file to upload
        // upload to cloudinary
        const response =await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto" // jpeg, png, pdf
        })
        //file uploaded successfully
        console.log("File uploaded to cloudinary successfully",response.url);//taking url after upload
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath) // remove the file from local uploads folder
        return null;
    }
};

cloudinary.v2.uploader.upload("https://upload.wikim org/wikipedia/commons/a/ae/Olympic_flag.jpg",
    {public:"olympic_flag"},
    function(error, result) {console.log(result);}
)

export {uploadOnCloudinary};