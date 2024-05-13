const jwt = require ('jsonwebtoken')
require("dotenv").config({ path: ".env" });

module.exports =  (req,res,next)=>{
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
        const userId = decodedToken.userId 
        console.log(userId) 
        req.auth = {
            userId : userId
        }
        next()
    } catch ( error) {
        res.status(401).json({error})
         console.log('erreur post')
        
    }
}