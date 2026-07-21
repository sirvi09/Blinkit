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
import rateLimit from 'express-rate-limit'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import reviewRouter from './route/review.route.js'
import dashboardRouter from './route/dashboard.route.js'
import { webhookStripe } from './controllers/order.controller.js'

const app = express()
app.set('trust proxy', 1) // Trust the first proxy (Render/Vercel) so rate limiting uses the real client IP

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

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Increased limit
    standardHeaders: true, 
    legacyHeaders: false, 
    message: {
        message: "Too many requests, please try again later.",
        error: true,
        success: false
    }
});
app.use('/api', apiLimiter);

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
app.use('/api/reviews',reviewRouter)
app.use('/api/dashboard',dashboardRouter)

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log("Server is running", PORT);
  });
});

