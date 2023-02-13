const Router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const User = require("../Models/User")

// Create new user
Router.post("/register", async (req, res) => {
    const {name, email, password, confirmPassword} = req.body
    
    if (!name) {
        return res.status(422).json({message: "Nome obrigatório"})
    }
    if (!email) {
        return res.status(422).json({message: "Email obrigatório"})
    }
    if (!password) {
        return res.status(422).json({message: "Defina um password"})
    }
    if (!confirmPassword || (confirmPassword !== password)) {
        return res.status(422).json({message: "Os passwords devem ser iguais"})
    }

    const userExists = await User.findOne({email: email})
    if (userExists) {
        return res.status(422).json({message: "Email já cadastrado!"})
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    User.create({name, email, password: passwordHash})
    .then( (user) => {
        return res.status(200).json(user)
    })
    .catch( (error) => {
        console.error(error)
        return res.status(500).json({error: "Não foi possível criar usuário."})
    })

})

// Login
Router.post("/login", async (req, res) => {
    const {email, password} = req.body
    
    if (!email) {
        return res.status(422).json({message: "Informe o email"})
    }
    if (!password) {
        return res.status(422).json({message: "Informe o password"})
    }

    // Check if user exists
    const user = await User.findOne({email: email})
    if (!user) {
        return res.status(404).json({message: "Usuário não encontrado"})
    }

    // verify password
    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
        return res.status(404).json({message: "Password inválido"})
    }

    // Create token
    try {
        const secret = process.env.SECRET
        const token = jwt.sign(
            { id: user._id },
            secret
        )
        return res.status(200).json({message: "Autenticado com sucesso", token})

    } catch(error) {
        console.error(error)
        return RegExp.status(500).json({error: "Ocorreu um erro no servidor"})
    }
})

Router.get("/user/:id", checkToken, async (req, res) => {
    const id = req.params.id
    User.findById(id, "-password")
    .then( (user) => {
        return res.status(200).json(user)
    })
    .catch( (error) => {
        // console.error(error)
        return res.status(404).json({message: "Usuário não encontrado"})
    })
})

// Token validation Middleware 
function checkToken (req, res, next) {
    const authToken = req.headers['authorization']
    const token = authToken && authToken.split(" ")[1]

    if (!token) {
        return res.status(401).json({message: "Acesso negado"})
    }

    try {
        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()
    } catch(error) {
        return res.status(400).json({message: "Token inválido"})
    }
}

module.exports = Router