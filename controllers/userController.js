const User = require('../models/userModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs")

//GET all users
const getUsers = async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });

  res.status(200).json(users);
};

//GET a single user
const getUser = async (req, res) => {
  const { id } = req.params;
  if (id == req.headers.jwt.userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'No such user' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'No such user' });
    }

    res.status(200).json(user);
  } else {
    return res.status(401).json({ error: 'User Not Authorized'})
  }
};


//CREATE a user - SIGN UP
const createUser = async (req, res) => {
  const { firstname, lastname, password, email, currency } = req.body;
  try {
    const user = await User.create({
      firstname,
      lastname,
      password: await bcrypt.hash(req.body.password,10),
      email,
      currency,
  })
  res.status(200).json(user);
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
      if (await bcrypt.compare(req.body.password, user.password)){
        console.log("logged in");
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
        res.status(200).json({token: token})
      } else{
        res.status(401).json({ error: "Incorrect Password" })
      }
    } else {
      res.status(404).json({ error: "User Not Found. Please Register" })
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error }); 
  }
}
  


//DELETE a user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such user' });
  }

  const user = await User.findOneAndDelete({ _id: id });

  if (!user) {
    return res.status(400).json({ error: 'No such user' });
  }

  res.status(200).json(user);
};

//UPDATE a user
const updateUser = async (req, res) => {
  const { id } = req.params;
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
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  authenticateUser,
  deleteUser,
  updateUser,
};
