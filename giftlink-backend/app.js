/*jshint esversion: 8 */
import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
//import { info } from './logger.js';
import authRoutes from './routes/authRoute.js';
import connectToDatabase from './models/db.js';
// import { loadData } from "./util/import-mongo/index.js";


const app = express();
app.use("*",cors());
const port = 3060;

// Connect to MongoDB; we just do this one time
connectToDatabase().then(() => {
    info('Connected to DB');
})
    .catch((e) => console.error('Failed to connect to DB', e));


app.use(json());

// Route files
// Gift API Task 1: import the giftRoutes and store in a constant called giftroutes
import giftRoutes from './routes/giftRoutes.js';

// Search API Task 1: import the searchRoutes and store in a constant called searchRoutes
import searchRoutes from './routes/searchRoutes.js';


import pinoHttp from 'pino-http';
import logger from './logger.js';

app.use(pinoHttp({ logger }));

// Use Routes
// Gift API Task 2: add the giftRoutes to the server by using the app.use() method.
app.use('/api/gifts',giftRoutes);

// Search API Task 2: add the searchRoutes to the server by using the app.use() method.
app.use('/api/search',searchRoutes);

app.use('/api/auth', authRoutes);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.get("/",(req,res)=>{
    res.send("Inside the server")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
