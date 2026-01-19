import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { checkDBConnection } from './config/db.js'
import adminRoutes from "./routes/adminRoutes.js";
import scanRoutes from "./routes/scanRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import path from "path";
dotenv.config()

const app = express()

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

checkDBConnection()


app.use("/api/admin", adminRoutes);
app.use("/api/scan", scanRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Health check (option
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(process.env.PORT, "0.0.0.0",() => {
    console.log(`Server running on port ${process.env.PORT}`)
});
