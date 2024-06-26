const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
require("dotenv").config({ path: ".env" });

// Function s'inscrire, creation d'un compte
exports.signup = (req,res,next)=>{

const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const errorMessages = [];

if (!emailFormat.test(req.body.email)) {
    errorMessages.push("Format de l'email invalide.");
}

if (errorMessages.length > 0) {
    return res.status(400).json({ messages: errorMessages });
}

    bcrypt.hash(req.body.password, 10)
    .then( hash =>{
        const user = new User({
            email : req.body.email,
            password : hash
        });
        user.save()
        .then(() => res.status(201).json({message : 'utilisateur créé'}))
        .catch(error => res.status(400).json({error}))
    })
    .catch(error => res.status(500).json({error}))
};

// Se connectert a son compte 
exports.login = (req,res,next)=>{
    User.findOne({
        email : req.body.email })
        .then(user => {
            if (user === null){
                res.status(401).json({message: 'paire id ou mdp incorrect'})

            } else {
                bcrypt.compare(req.body.password, user.password)
                .then(valid =>{
                    if (!valid){
                        res.status(401).json({message : ' paire id ou mdp inccorect'})
                    } else {
                        res.status(200).json({
                            userId : user._id,
                            token: jwt.sign(
                                { userId: user._id },
                                process.env.SECRET_TOKEN,
                                { expiresIn: "24h" }
                            ),
                        })
                    }
                })
                .catch(error => res.status(500).json({error}))
            }
        })
        .catch(error => res.status(500).json({error}))
}