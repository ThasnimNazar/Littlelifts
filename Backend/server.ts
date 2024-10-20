import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import path from 'path'
import http from 'http';
import cors from 'cors'
import sitterroute from './Routes/sitterRoute';
import adminroute from './Routes/adminRoute'
import parentroute from './Routes/parentRoute'
import { connectDB } from './Connections/connection';
import { initializeSocketIO } from './Connections/socket'

dotenv.config();

const port = process.env.PORT || 5003

const app = express();
connectDB()


const server = http.createServer(app);
initializeSocketIO(server);   


const corsOptions = {
origin: [process.env.CLIENT_SITE_URLS as string,'http://localhost:5003','http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  crossOriginOpenerPolicy:'same-origin'
};



app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
}); //middleware used to log the incoming request for a specific route ,it will execute for all the routes.

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser())
app.use(cors(corsOptions));



app.use('/api/sitter',sitterroute);    
app.use('/api/admin',adminroute);
app.use('/api/parent',parentroute);

app.use(express.static(path.join(__dirname, "../Frontend/dist")));
app.get("*", (req, res) => 
  res.sendFile(path.resolve(__dirname, "../Frontend/dist", "index.html"))
);





server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
