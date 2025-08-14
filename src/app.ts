import cors, { CorsOptions } from 'cors';
import express, { Application } from 'express'
import { createServer } from 'http'
import mongoConnect from './config/db';
import dotenv from 'dotenv';
import studentRoute from './routes/student/studentRoute';

dotenv.config()

const app : Application = express()
const server = createServer(app)

const corsOptions: CorsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));


const port: string | number = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({extended: true}))

mongoConnect()

app.use('/api/user', studentRoute)

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})