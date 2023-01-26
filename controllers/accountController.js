const Account = require('../models/accountModel');
const mongoose = require('mongoose');

//GET all accounts
const getAccounts = async (req, res) => {
  const accounts = await Account.find({userID: req.headers.jwt.userId}).sort({ createdAt: -1 });

  res.status(200).json(accounts);
};

//GET a single account
const getAccount = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such account' });
  }

  const account = await Account.findById(id);
  if (!account) {
    return res.status(404).json({ error: 'No such account' });
  }
  
  if(account.userID != req.headers.jwt.userId) //if account does not belong to the user
    return res.status(404).json({ error: 'No such account' });

  res.status(200).json(account);
};

//POST a new account
const createAccount = async (req, res) => {
  const { name, accounttype, balance, colorhex } = req.body;
  const userID = req.headers.jwt.userId;
  //add doc to db
  try {
    const account = await Account.create({
      name,
      accounttype,
      userID,
      balance,
      colorhex,
    });
    res.status(200).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//DELETE a account
const deleteAccount = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such account' });
  }

  const account = await Account.findOneAndDelete({ _id: id, userID: req.headers.jwt.userId });

  if (!account) {
    return res.status(400).json({ error: 'No such account' });
  }

  res.status(200).json(account);
};

//UPDATE a account
const updateAccount = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such account' });
  }

  const account = await Account.findOneAndUpdate(
    { _id: id, userID: req.headers.jwt.userId },
    {
      ...req.body,
    }
  );

  if (!account) {
    return res.status(400).json({ error: 'No such account' });
  }

  res.status(200).json(account);
};

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  deleteAccount,
  updateAccount,
};
