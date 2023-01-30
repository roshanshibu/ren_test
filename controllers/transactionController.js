const Transaction = require('../models/transactionModel');
const Account = require('../models/accountModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

//GET all transactions
const getTransactions = async (req, res) => {
  // const { accountID } = req.params;
  // const transactions = await Transaction.find({ accountID: accountID }).sort({
  //   createdAt: -1,
  const transactions = await calcTransactions(req.headers.jwt.userId);

  res.status(200).json(transactions);
};

async function calcTransactions(UserID) {
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
  //pipeline for transactions
  const agg2 = await Transaction.aggregate([
    { $match: { userID: { $eq: UserID } } },
    {
      $addFields: {
        categoryID: { $toObjectId: '$categoryID' },
        accountID: { $toObjectId: '$accountID' },
        day: { $dayOfMonth: '$date' },
        month: { $month: '$date' },
        year: { $year: '$date' },
        date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
      },
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
      $lookup: {
        from: 'categories',
        localField: 'categoryID',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $group: {
        _id: '$date',
        transactions: { $push: '$$ROOT' },
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $project: {
        _id: 1,
        transactions: {
          $map: {
            input: '$transactions',
            as: 'transaction',
            in: {
              id: '$$transaction._id',
              description: '$$transaction.description',
              amount: '$$transaction.amount',
              type: '$$transaction.type',
              // date: '$$transaction.date',
              account: {
                $mergeObjects: [
                  { $arrayElemAt: ['$$transaction.account', 0] },
                  {
                    $let: {
                      vars: {
                        name: {
                          $arrayElemAt: ['$$transaction.account.name', 0],
                        },
                      },
                      in: { name: '$name' },
                    },
                  },
                ],
              },
              category: {
                $mergeObjects: [
                  { $arrayElemAt: ['$$transaction.category', 0] },
                  {
                    $let: {
                      vars: {
                        name: {
                          $arrayElemAt: ['$$transaction.category.name', 0],
                        },
                        icon: {
                          $arrayElemAt: ['$$transaction.category.icon', 0],
                        },
                        color: {
                          $arrayElemAt: ['$$transaction.category.color', 0],
                        },
                      },
                      in: { name: '$name', icon: '$icon', color: '$color' },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
  ]);

  const res = [agg1, agg2];

  return res;
}

//GET a single transaction
const getTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such transaction' });
  }

  const UserID = req.headers.jwt.userId;

  const transaction = await Transaction.findById(id);
  if (!transaction) {
    return res.status(404).json({ error: 'No such transaction' });
  }

  if (!transaction.userID == UserID)
    return res.status(404).json({ error: 'No such transaction' });

  res.status(200).json(transaction);
};

const checkTransactionCreation = async (req, res) => {
  if (req.body.type == 'Transfer') createTransfer(req, res);
  else createTransaction(req, res);
};

//POST a new transaction
const createTransaction = async (req, res) => {
  const { accountID, description, amount, date, categoryID, type } = req.body;
  const userID = req.headers.jwt.userId;

  try {
    const transaction = await Transaction.create({
      accountID,
      userID,
      description,
      amount,
      date,
      categoryID,
      type,
    });
    if (categoryID == null)
      return res.status(400).json({ error: 'categoryID undefined' });

    res.status(200).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message }); //error messages not working
  }
};

const createTransfer = async (req, res) => {
  //POST
  //make new transaction with type transfer
  const { accountID, fromAccountID, description, amount, date, type } =
    req.body;
  const userID = req.headers.jwt.userId;

  //Check if accounts are valid
  if (
    !mongoose.Types.ObjectId.isValid(accountID) ||
    !mongoose.Types.ObjectId.isValid(fromAccountID)
  )
    return res.status(400).json({ error: 'No such account' });

  try {
    const transaction = await Transaction.create({
      accountID,
      fromAccountID,
      userID,
      description,
      amount,
      date,
      type,
    });

    //Update balance in specified accounts
    const fromAccount = await Account.findById(fromAccountID);
    const toAccount = await Account.findById(accountID);

    const fromAccount_newBalance = fromAccount.balance - amount;
    const toAccount_newBalance = +toAccount.balance + +amount;

    await Account.findOneAndUpdate(
      { _id: fromAccountID },
      {
        balance: fromAccount_newBalance,
      }
    );
    await Account.findOneAndUpdate(
      { _id: accountID },
      {
        balance: toAccount_newBalance,
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

  const transaction = await Transaction.findOneAndDelete({
    _id: id,
    userID: req.headers.jwt.userId,
  });

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
    { _id: id, userID: req.headers.jwt.userId },
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
// Transaction.aggregate([
//   {
//     $match: {
//       createdAt: {
//         $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//       },
//     },
//   },
//   {
//     $sort: { createdAt: -1 },
//   },
//   {
//     $lookup: {
//       from: 'accounts',
//       localField: 'accountID',
//       foreignField: '_id',
//       as: 'account',
//     },
//   },
//   {
//     $unwind: '$account',
//   },
//   {
//     $lookup: {
//       from: 'categories',
//       localField: 'categoryID',
//       foreignField: '_id',
//       as: 'category',
//     },
//   },
//   {
//     $unwind: '$category',
//   },
//   {
//     $project: {
//       description: 1,
//       amount: 1,
//       createdAt: 1,
//       type: 1,
//       'account.name': 1,
//       'category.name': 1,
//       'category.icon': 1,
//     },
//   },
// ]);

module.exports = {
  getTransactions,
  getTransaction,
  checkTransactionCreation,
  deleteTransaction,
  updateTransaction,
};
