//require('dotenv').config({path:'./env'}); //it disrupts the consistency of our code 

import dotenv from "dotenv";//this is the new way of importing modules in ES6
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path: './.env'
}); //this will load the .env file and make the variables available in process.env

connectDB().
then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server started on port ${process.env.PORT}`)
    })
}).
catch((err)=>{
    console.log("Error connecting to MongoDB",err)
    throw err
})






/*
import express from "express";

const app=express();

;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGO_URI}${DB_NAME}`)
        console.log("Connected to MongoDB")
        app.on("error",(err)=>{
            console.log("Error starting server",err)
            throw err
        })

        app.listen(process.env.PORT,()=>{
            console.log(`Server started on port ${process.env.PORT}`)
        })
    }catch(err){
        console.log("Error connecting to MongoDB",err)
        throw err
    }
})()
*/