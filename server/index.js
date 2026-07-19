import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import dashboardRouter from './route/dashboard.route.js'
import { webhookStripe } from './controllers/order.controller.js'

const app = express()

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });
});

app.use(cors({
    credentials : true ,
    origin: process.env.FRONTEND_URL
}))

// Stripe webhook needs raw body for signature verification
app.post('/api/order/webhook', express.raw({ type: 'application/json' }), webhookStripe)

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(helmet({
    crossOriginResourcePolicy : false 
}))
app.use(compression())
const PORT =  process.env.PORT || 5000


app.get('/' , (req,res)=> {
      // server to client 
      res.json({
        message : " Server is running " +  PORT
      })
})

app.use('/api/user', userRouter)
app.use('/api/category',categoryRouter)
app.use('/api/file',uploadRouter)
app.use('/api/subcategory',subCategoryRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/address',addressRouter)
app.use('/api/order',orderRouter)
app.use('/api/dashboard',dashboardRouter)

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log("Server is running", PORT);
  });
});

