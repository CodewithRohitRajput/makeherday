import express from 'express'
import 'dotenv/config'
import connectDB from './config/db.js';
import cors from "cors"
import giftRouter from './routes/giftRoutes.js'
import paymentRouter from './routes/paymentRoute.js'

const app = express()

const port = 8000;

app.use(express.json())
app.use(cors())

app.use('/gift', giftRouter)
app.use('/pay', paymentRouter)

await connectDB()

app.use('/', (req,res)=>{
    res.set('make her day ❤️')
})

app.listen(port, ()=>{
    console.log('make her day ❤️')
})
