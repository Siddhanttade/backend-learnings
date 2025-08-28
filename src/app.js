import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
//cors middleware used to enable CORS with various options
app.use(cors(
    app.use({
    origin: process.env.CORS_ORIGIN, 
    credentials: true, // Allow cookies to be sent
    })
));

//middleware to parse json data
app.use(express.json({limit: '16kb'}));
//middleware for url encoded data
app.use(express.urlencoded({ extended: true, limit: '16kb' })); 
app.use(cookieParser());

export { app };