const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.headers.jwt
    try {
      const decoded = jwt.verify(token, process.env.SECRET)
      req.headers.jwt = decoded
      next();
    } catch(error) {
      console.log(error)
      res.status(400).json({ error: error }); 
    }
};
