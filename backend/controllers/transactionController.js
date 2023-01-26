const Transaction = require('../models/transactionModel');
const Account = require('../models/accountModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

//GET all transactions
const getTransactions = async (req, res) => {
  const {accountID} = req.params;
  const transactions = await Transaction.find({accountID: accountID}).sort({ createdAt: -1 });

  res.status(200).json(transactions);
};

//GET a single transaction
const getTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such transaction' });
  }

  const transaction = await Transaction.findById(id);
  if (!transaction) {
    return res.status(404).json({ error: 'No such transaction' });
  }

  if(!transaction.userID == req.headers.jwt.userId) 
  return res.status(404).json({ error: 'No such transaction' });

  res.status(200).json(transaction);
};

const checkTransactionCreation = async (req, res) => {
  if(req.body.ttype == "Transfer")
    createTransfer(req, res);
  else
    createTransaction(req, res);
};

//POST a new transaction
const createTransaction = async (req, res) => {
  const { accountID, description, amount, categoryID, ttype } = req.body;
  //add doc to db
  try {
    const transaction = await Transaction.create({
      accountID,
      description,
      amount,
      categoryID,
      ttype,
    });
    if (categoryID == null)
      return res.status(400).json({ error: 'categoryID undefined' });

    res.status(200).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message }); //error messages not working
  }
};

const createTransfer = async (req, res) => { //POST
  //make new transaction with type transfer
  const { accountID, fromAccountID, description, amount, ttype } = req.body;

  //Check if accounts are valid
  if (!mongoose.Types.ObjectId.isValid(accountID) ||  !mongoose.Types.ObjectId.isValid(fromAccountID))
  return res.status(400).json({ error: 'No such account' });

  try {
    const transaction = await Transaction.create({
      accountID,
      fromAccountID,
      description,
      amount,
      ttype,
    });

    //Update balance in specified accounts
    const fromAccount = await Account.findById(fromAccountID);
    const toAccount = await Account.findById(accountID);

    const fromAccount_newBalance = (fromAccount.balance - amount);
    const toAccount_newBalance = (+toAccount.balance + +amount);

    await Account.findOneAndUpdate(
      { _id: fromAccountID },
      {
        balance: fromAccount_newBalance
      }
    );
    await Account.findOneAndUpdate(
      { _id: accountID },
      {
        balance: toAccount_newBalance
      }
    );

    res.status(200).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//DELETE a transaction
const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such transaction' });
  }

  const transaction = await Transaction.findOneAndDelete({ _id: id });

  if (!transaction) {
    return res.status(400).json({ error: 'No such transaction' });
  }

  res.status(200).json(transaction);
};

//UPDATE a transaction
const updateTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such transaction' });
  }

  const transaction = await Transaction.findOneAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!transaction) {
    return res.status(400).json({ error: 'No such transaction' });
  }

  res.status(200).json(transaction);
};

// function handleValidationError(err, body) {
//     for (field in err.errors) {
//       switch (err.errors[field].path) {
//         case 'firstname':
//           body['firstnameError'] = err.errors[field].message;
//           break;
//         case 'lastname':
//           body['lastnameError'] = err.errors[field].message;
//           break;
//         case 'password':
//           body['passwordError'] = err.errors[field].message;
//           break;
//         case 'email':
//           body['emailError'] = err.errors[field].message;
//           break;
//         case 'mobile':
//           body['mobileError'] = err.errors[field].message;
//           break;
//       }
//     }
//   }

//Pipeline to show all transactions
Transaction.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  },
  {
    $sort: { createdAt: -1 },
  },
  {
    $lookup: {
      from: 'accounts',
      localField: 'accountID',
      foreignField: '_id',
      as: 'account',
    },
  },
  {
    $unwind: '$account',
  },
  {
    $lookup: {
      from: 'categories',
      localField: 'categoryID',
      foreignField: '_id',
      as: 'category',
    },
  },
  {
    $unwind: '$category',
  },
  {
    $project: {
      description: 1,
      amount: 1,
      createdAt: 1,
      type: 1,
      'account.name': 1,
      'category.name': 1,
      'category.icon': 1,
    },
  },
]);

module.exports = {
  getTransactions,
  getTransaction,
  checkTransactionCreation,
  deleteTransaction,
  updateTransaction,
};
