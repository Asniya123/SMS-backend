import cors, { CorsOptions } from 'cors';
import express, { Application } from 'express'
import { createServer } from 'http'
import mongoose from 'mongoose';
import mongoConnect from './config/db';
import dotenv from 'dotenv';
import studentRoute from './routes/student/studentRoute';
import leaveRoute from './routes/leave/leaveRoute'
import courseRoute from './routes/course/courseRoute';
import adminRoute from './routes/admin/adminRoute';

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

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Backend server is running!' });
});

// Database test route
app.get('/test-db', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        const statusMap = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        res.json({ 
            message: 'Database status check',
            status: statusMap[dbStatus as keyof typeof statusMap],
            readyState: dbStatus
        });
    } catch (error) {
        res.status(500).json({ error: 'Database check failed' });
    }
});

mongoConnect()

app.use('/api/auth', studentRoute)
app.use('/api/admin/auth', adminRoute)
app.use('/api/courses', courseRoute)
app.use('/api/leaves', leaveRoute) 

console.log('Routes mounted:');
console.log('- /test (GET)');
console.log('- /api/courses/*');
console.log('- /api/admin/auth/*');
console.log('- /api/auth/*');

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  
})