import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            index:true,         //used for search optimization
            lowercase:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        avatar:{
            type:String,    //cloudinary url
            required:true,
        },
        coverImage:{
            type:String,    //cloudinary url   
        },
        watchHistiory:[
            {
                type:Schema.Types.ObjectId,     
                ref:"Video",
            }
        ],
        password:{
            type:String,
            required:[true,"Password is required"],
            minlength:6,
        },
        refreshToken:{
            type:String,
        }
    }   
,{timestamps:true}    
);

//this is used to encrypt the password before saving it to the database
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next(); //this line checks if the password field is modified or not
    this.password=await bcrypt.hash(this.password,10);
    next();
});
//checking if the entered password is correct or not
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password); //here we are comparing the entered password with the hashed password stored in the database
}
//method to generate access token
userSchema.methods.generateAccessToken=function(){
    return jwt.sign( //sign method creates a new token
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}
//method to generate refresh token
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign( //sign method creates a new token
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}   
export const User=mongoose.model("User",userSchema);
