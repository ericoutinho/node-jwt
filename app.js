require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const app = express()
app.use(express.json())

// home
app.get("/", (req, res) => {
    return res.status(200).json({message: "Hello world"})
})

// User routes
const userRoutes = require("./Routes/userRoutes")
app.use("/auth", userRoutes)

// Mongoose connection
mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@nodejwt.esjhypx.mongodb.net/?retryWrites=true&w=majority`)
.then( () => {
    console.log("\x1b[36m%s\x1b[0m", "MongoDB connected!")
    app.listen(3000, () => {
        console.log("\x1b[33m%s\x1b[0m", "Server is up!")
    })
})
.catch((error) => {
    console.error(error)
})
