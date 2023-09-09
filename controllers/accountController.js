const Account = require('../models/accountModel');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Metadata = require('../models/metadataModel');

//GET all accounts
const getAccounts = async (req, res) => {
  const type = req.query.type;
  const name = req.query.name;

  const accounts = await calcAccounts(req.headers.jwt.userId, type, name, req);

  res.status(200).json(accounts);
};

async function calcAccounts(UserID, type, name, req) {
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

  // Show all accounts pipeline
  const match = { userID: { $eq: UserID } };
  if (type) {
    match.type = { $eq: type };
  }
  if (name) {
    match.name = { $eq: name };
  }
  const agg2 = await Account.aggregate([
    {
      $match: match,
    },
    {
      $project: {
        _id: 1,
        name: 1,
        type: 1,
        balance: { $round: ['$balance', 2] },
      },
    },
  ]);

  const accountsWithLinks = agg2.map(account => {
    return {
      ...account,
      links: [
        {
          rel: "self",
          href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`
        },
        {
          rel: "delete",
          href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`,
          method: "DELETE"
        },
        {
          rel: "update",
          href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`,
          method: "PATCH"
        }
      ]
    };
  });

  const res = [agg1, accountsWithLinks];
  return res;
}

//GET a single account
const getAccount = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such account' });
  }

  let account = await Account.findById(id);
  if (!account) {
    return res.status(404).json({ error: 'No such account' });
  }

  //meta
  const currentDate = new Date();
  const ageInMilliseconds = currentDate - account.createdAt;
  const age = {
    days: Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (ageInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ),
    minutes: Math.floor((ageInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)),
  };

  Metadata.findOneAndUpdate(
    { accountId: account._id },
    { $set: { age } },
    { upsert: true, new: true },
    function (err, doc) {
      if (err) {
        console.log(err);
      }
      console.log('Metadata added/updated successfully');
    }
  );

  //meta close

  if (account.userID != req.headers.jwt.userId)
    //if account does not belong to the user
    return res.status(404).json({ error: 'No such account' });

  account = {
    ...account.toObject(),
    links: [
      {
        rel: "self",
        href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`
      },
      {
        rel: "delete",
        href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`,
        method: "DELETE"
      },
      {
        rel: "update",
        href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`,
        method: "PATCH"
      }
    ]
  };
  res.status(200).json({ account, age });
};

const getAccountsPagination = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const limit = parseInt(req.params.limit) || 10;

  const accounts = await Account.find({
    userID: req.headers.jwt.userId,
  })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalAccounts = await Account.countDocuments({
    userID: req.headers.jwt.userId,
  });

  const pagination = {
    currentPage: page,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalAccounts / limit),
    totalItems: totalAccounts,
  };

  const accountsWithLinks = accounts.map(account => {
    return {
      ...account,
      links: [
        {
          rel: "self",
          href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`
        },
        {
          rel: "delete",
          href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`,
          method: "DELETE"
        },
        {
          rel: "update",
          href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`,
          method: "PATCH"
        }
      ]
    };
  });
  res.status(200).json({ accountsWithLinks, pagination });
};

//PUT a new account
const createAccount = async (req, res) => {
  const { name, type, balance, color } = req.body;
  const userID = req.headers.jwt.userId;

  try {
    let account = await Account.findOne({
      //Check if account with same name, type and userid already exists
      name,
      type,
      userID,
    });
    if (!account) {
      account = await Account.create({
        name,
        type,
        userID,
        balance,
        color,
      });
    }
    const accountWithLinks = {
      ...account.toObject(),
      links: [
        {
          rel: "self",
          href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`
        },
        {
          rel: "delete",
          href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`,
          method: "DELETE"
        },
        {
          rel: "update",
          href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`,
          method: "PATCH"
        }
      ]
    };
    res.status(200).json(accountWithLinks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//DELETE an account
const deleteAccount = async (req, res) => {
  const { id } = req.params;
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
};

//UPDATE an account
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

  const accountWithLinks = {
    ...account.toObject(),
    links: [
      {
        rel: "self",
        href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`
      },
      {
        rel: "delete",
        href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`,
        method: "DELETE"
      },
      {
        rel: "update",
        href: `${req.protocol}://${req.get("host")}/api/accounts/${account._id}`,
        method: "PATCH"
      }
    ]
  };
  res.status(200).json(accountWithLinks);
};

module.exports = {
  getAccounts,
  getAccount,
  getAccountsPagination,
  createAccount,
  deleteAccount,
  updateAccount,
};
