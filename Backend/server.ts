import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import { Server } from 'socket.io';
import { createServer } from 'node:http';
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
console.log(server,'server')  
initializeSocketIO(server);   


const corsOptions = {
  origin: 'https://localhost:3000', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};


app.use(cors(corsOptions));



app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
}); //middleware used to log the incoming request for a specific route ,it will execute for all the routes.

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser())

app.use('/api/sitter',sitterroute);
app.use('/api/admin',adminroute);
app.use('/api/parent',parentroute);



app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Node.js + Express!');
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
