const User = require('../models/userModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const jwt_decode = require("jwt-decode")
const bcrypt = require("bcryptjs")
const {OAuth2Client} = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID);

//GET all users
const getUsers = async (req, res) => {
  if (req.headers.jwt.userId != "insertadminid")
    return res.status(401).json({ error: 'User Not Authorized' });

  const users = await User.find({}).sort({ createdAt: -1 });

  res.status(200).json(users);
};

//GET a single user
const getUser = async (req, res) => {
  const { id } = req.params;
  if (id == req.headers.jwt.userId || req.headers.jwt.userId == "insertadminid") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'No such user' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'No such user' });
    }

    res.status(200).json(user);
  } else {
    return res.status(401).json({ error: 'User Not Authorized' })
  }
};

//Function to generate JWT TOKEN
function generateJwtToken(user) { 
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.SECRET,
    {
      expiresIn: "2h",
    }
  )  
  return token
} 

// Function to verify OAuth2 Token
async function verify(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    return true
  } catch(error) {
    return false; 
  } 
}


//CREATE a user - SIGN UP
const createUser = async (req, res) => {
  const { firstname, lastname, password, email, currency } = req.body;
  try {
    const user = await User.create({
      firstname,
      lastname,
      password: await bcrypt.hash(req.body.password, 10),
      email,
      currency,
    })
    console.log("logged in")
    const token = generateJwtToken(user) 
    res.status(200).json({token: token})
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error.message });
  }
}

//CREATE a user if not registered - on Oauth2 login
const authorizeOauth2User = async (req, res) => {
  const token = req.headers.jwt
  try {
    if (await verify(token)) {
      const decoded = jwt_decode(token)
      const fetchedUser = await User.findOne({
      email: decoded.email,
      })
      if (fetchedUser) {
        console.log("logged in")
        const generatedToken = generateJwtToken(fetchedUser)
        res.status(200).json({token: generatedToken})
      } else {
        const user = await User.create({
          firstname: decoded.given_name,
          lastname: decoded.family_name,
          password: "oAuth2",
          email: decoded.email,
          currency: "$",
        })
        console.log("logged in")
        const generatedToken = generateJwtToken(user)
        res.status(200).json({token: generatedToken})
      }
      } else {
        res.status(401).json({ "error": "Invalid OAuth2 Token" })
      }
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error }); 
  }
}


//AUTHENTICATE a user - LOGIN
const authenticateUser = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    })
    if(user) {
      if (user.password != "oAuth2") {
        if (await bcrypt.compare(req.body.password, user.password)){
          console.log("logged in");
          const token = generateJwtToken(user)
          res.status(200).json({token: token})
        } else{
          res.status(401).json({ error: "Incorrect Password" })
        }
      } else {
        res.status(400).json({ error: "Try Sign-In With Google" })
      }
    } else {
      res.status(404).json({ error: "User Not Found. Please Register" })
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error.message });
  }
}



//DELETE a user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (id == req.headers.jwt.userId || req.headers.jwt.userId == "insertadminid") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'No such user' });
    }

    const user = await User.findOneAndDelete({ _id: id });

    if (!user) {
      return res.status(400).json({ error: 'No such user' });
    }

    res.status(200).json(user);
  } else {
    return res.status(401).json({ error: 'User Not Authorized' })
  }
};

//UPDATE a user
const updateUser = async (req, res) => {
  const { id } = req.params;
  if (id == req.headers.jwt.userId || req.headers.jwt.userId == "insertadminid") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'No such user' });
    }

    const user = await User.findOneAndUpdate(
      { _id: id },
      {
        ...req.body,
      }
    );

    if (!user) {
      return res.status(400).json({ error: 'No such user' });
    }

    res.status(200).json(user);
  } else {
    return res.status(401).json({ error: 'User Not Authorized' })
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  authorizeOauth2User,
  authenticateUser,
  deleteUser,
  updateUser,
};
