import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectToMongoDB from './configs/mongodb.js';
import {clerkWebhooks} from './controllers/webhook.js'

//initialize express
const app=express()

//connect to db
await connectToMongoDB();

//Middlewares
app.use(cors())

//Routes
app.get('/',(req, res)=> res.send("API Working"))
app.post('/clerk',express.json,clerkWebhooks)

//Port
const PORT =process.env.process || 5000

app.listen(PORT, ()=>{
    console.log(`Server is running on Port ${PORT}`)
})