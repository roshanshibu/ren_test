const User = require('../models/userModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const jwt_decode = require("jwt-decode")
const bcrypt = require("bcryptjs")
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID);

//GET all users
const getUsers = async (req, res) => {
  if (req.headers.jwt.userId != "insertadminid")
    return res.status(401).json({ error: 'User Not Authorized' });

  const email = req.query.email;
  const firstname = req.query.firstname;
  const lastname = req.query.lastname;

  const query = {};
  if (email) query.email = email;
  if (firstname) query.firstname = firstname;
  if (lastname) query.lastname = lastname;

  const users = await User.find(query).sort({ createdAt: -1 });

  res.status(200).json(users);
};

//GET a single User Profile
const getUser = async (req, res) => {

  const id = req.headers.jwt.userId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such user' });
  }
  try {
    const user = await User.findById(id)
    res.status(200).json(user)
  } catch (error) {
    res.status(404).json({ error: error })

  }
};

const getUsersPagination = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const limit = parseInt(req.params.limit) || 10;

  if (req.headers.jwt.userId != "insertadminid")
  return res.status(401).json({ error: 'User Not Authorized' });

  const users = await User.find({
    userID: req.headers.jwt.userId,
  })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments({
    userID: req.headers.jwt.userId,
  });

  const pagination = {
    currentPage: page,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalUsers / limit),
    totalItems: totalUsers,
  };

  res.status(200).json({ users, pagination });
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
  } catch (error) {
    return false;
  }
}


//CREATE a user - SIGN UP
const createUser = async (req, res) => {
  const { firstname, lastname, password, email, currency } = req.body;
  try {
    let user = await User.findOne({
      email
    });
    if (!user) {
      user = await User.create({
        firstname,
        lastname,
        password: await bcrypt.hash(req.body.password, 10),
        email,
        currency,
      })
    }
    console.log("logged in")
    const token = generateJwtToken(user)
    res.status(200).json({ token: token })
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
        res.status(200).json({ token: generatedToken })
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
        res.status(200).json({ token: generatedToken })
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
    if (user) {
      if (user.password != "oAuth2") {
        if (await bcrypt.compare(req.body.password, user.password)) {
          console.log("logged in");
          const token = generateJwtToken(user)
          res.status(200).json({ token: token })
        } else {
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

  const id = req.headers.jwt.userId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such user' });
  }
  try {

    const user = await User.findOneAndUpdate(
      { _id: id },
      {
        ...req.body,

      },
      {
        new: true
      }
    )
    res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: error })

  }
};

module.exports = {
  getUsers,
  getUser,
  getUsersPagination,
  createUser,
  authorizeOauth2User,
  authenticateUser,
  deleteUser,
  updateUser,
};
