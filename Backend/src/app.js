const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "https://resume-analyzer-nu-eight.vercel.app",
    // origin: "http://localhost:5173",
    // origin: "http://localhost:3000",
    
    credentials: true
}))

// Health check for cron-job.org ping
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app