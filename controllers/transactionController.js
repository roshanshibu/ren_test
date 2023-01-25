const Transaction = require('../models/transactionModel');
const mongoose = require('mongoose');

//GET all transactions
const getTransactions = async (req, res) => {
  const transactions = await Transaction.find({}).sort({ createdAt: -1 });

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

  res.status(200).json(transaction);
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
    res.status(200).json(transaction);
  } catch (err) {
    if (err.name == 'ValidationError') handleValidationError(err, req.body);

    res.status(400).json({ error: err.msg }); //error messages not working
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

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  deleteTransaction,
  updateTransaction,
};
