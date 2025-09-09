import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
//cors middleware used to enable CORS with various options
app.use(cors({
    origin: process.env.CORS_ORIGIN, 
    credentials: true, //allows cookies
}));

//middleware to parse json data
app.use(express.json({limit: '16kb'}));
//middleware for url encoded data
app.use(express.urlencoded({ extended: true, limit: '16kb' })); 
app.use(cookieParser());

//routes import

import userRouter from "./routes/user.routes.js";

//routes declaration
//app.get if we write this syntax it would be wrong because earlier we were writing the controllers and routes here
//now we have separated them so we will use app.use
app.use('/api/v1/users', userRouter);

//url: http://localhost:8000/api/v1/users/register we dont need to import again and again

export { app };