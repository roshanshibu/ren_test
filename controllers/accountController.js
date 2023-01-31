const Account = require('../models/accountModel');
const mongoose = require('mongoose');
const User = require('../models/userModel');

//GET all accounts
const getAccounts = async (req, res) => {
  const accounts = await calcAccounts(req.headers.jwt.userId);

  res.status(200).json(accounts);
};

async function calcAccounts(UserID) {
  //pipeline for currency
  const agg1 = await User.aggregate([
    {
      $addFields: {
        userID: { $toString: '$_id' },
      },
    },
    {
      $match: { userID: { $eq: UserID } },
    },
    {
      $project: {
        currency: 1,
      },
    },
  ]);

  //Show all accounts pipeline
  const agg2 = await Account.aggregate([
    {
      $match: { userID: { $eq: UserID } },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        type: 1,
        balance: 1,
      },
    },
  ]);

  const res = [agg1, agg2];

  return res;
}

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

  if (account.userID != req.headers.jwt.userId)
    //if account does not belong to the user
    return res.status(404).json({ error: 'No such account' });

  res.status(200).json(account);
};

//POST a new account
const createAccount = async (req, res) => {
  const { name, type, balance, color } = req.body;
  const userID = req.headers.jwt.userId;

  try {
    const account = await Account.create({
      name,
      type,
      userID,
      balance,
      color,
    });
    res.status(200).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//DELETE an account
const deleteAccount = async (req, res) => {
  const { id } = req.params;
  if (
    id == req.headers.jwt.userId ||
    req.headers.jwt.userId == 'insertadminid'
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'No such account' });
    }

    const account = await Account.findOneAndDelete({
      _id: id,
      userID: req.headers.jwt.userId,
    });

    if (!account) {
      return res.status(400).json({ error: 'No such account' });
    }

    res.status(200).json(account);
  } else {
    return res.status(401).json({ error: 'User Not Authorized' });
  }
};

//UPDATE an account
const updateAccount = async (req, res) => {
  const { id } = req.params;
  if (
    id == req.headers.jwt.userId ||
    req.headers.jwt.userId == 'insertadminid'
  ) {
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
  } else {
    return res.status(401).json({ error: 'User Not Authorized' });
  }
};

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  deleteAccount,
  updateAccount,
};
