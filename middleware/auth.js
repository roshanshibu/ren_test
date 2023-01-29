const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode")
const {OAuth2Client} = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID);

module.exports = async (req, res, next) => {
    const token = req.headers.jwt
    try {
      const decoded = jwt_decode(token)
      if (decoded.iss) {
        console.log("this is from GOOGLE")
        if(await verify(token)){
          next();
        }
      } else {
        console.log("this is MY JWT")
        if(await verifyJWT(token)){
          next();
        }
      }
    } catch(error) {
      res.status(401).json({ error: error }); 
    }  
    
    async function verify(token) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const requiredOauthInfo = ({ 'userID' : payload['sub'], 'email' : payload['email']  })
        req.headers.jwt = requiredOauthInfo
        return true
      } catch(error) {
        res.status(401).json({ "error": error+"" })
        return false; 
      } 
    }

    async function verifyJWT(token) {
      try {
        const verifiedToken = jwt.verify(token, process.env.SECRET)
        req.headers.jwt = verifiedToken
        return true
      } catch(error) {
        res.status(401).json({ error: error })
        return false
      }
    }
    
};
