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

  let result = [];

  //unpacks arrays
  transactions.forEach((element) => {
    element.forEach((item) => {
      result.push(item);
    });
  });

  //renames "transactions" to date value
  result = result.map((obj) => {
    if (obj.hasOwnProperty('transactions')) {
      const { transactions, ...rest } = obj;
      const newObj = { [obj._id]: transactions, ...rest };
      delete newObj._id;
      return newObj;
    }
    return obj;
  });

  //merge objects into one
  result = Object.assign({}, ...result);

  res.status(200).json(result);
};

const getSpecificTransactions = async (req, res) => {
  const year = req.params.year;
  const month = req.params.month;
  const specTransactions = await calcspecTransactions(
    req.headers.jwt.userId,
    year,
    month
  );

  let result = [];

  //unpacks arrays
  specTransactions.forEach((element) => {
    element.forEach((item) => {
      result.push(item);
    });
  });

  //renames "transactions" to date value
  result = result.map((obj) => {
    if (obj.hasOwnProperty('transactions')) {
      const { transactions, ...rest } = obj;
      const newObj = { [obj._id]: transactions, ...rest };
      delete newObj._id;
      return newObj;
    }
    return obj;
  });

  //merge objects into one
  result = Object.assign({}, ...result);

  res.status(200).json(result);
};

//specific Transaction by year and month
async function calcspecTransactions(UserID, year, month) {
  //pipeline for currency

  const query = {
    userID: UserID,
  };
  const agg1 = await User.aggregate([
    {
      $addFields: {
        userID: { $toString: '$_id' },
      },
    },
    {
      $match: query,
    },
    {
      $project: {
        _id: 0,
        currency: 1,
      },
    },
  ]);
  //pipeline for transactions
  let nextMonth = (parseInt(month, 10) + 1).toString().padStart(2, '0');
  let nextYear = year;
  if (month === '12') {
    nextMonth = '01';
    nextYear = (parseInt(year, 10) + 1).toString();
  }
  const agg2 = await Transaction.aggregate([
    {
      $match: {
        userID: { $eq: UserID },
        date: {
          $gte: new Date(`${year}-${month}-01`),
          $lt: new Date(`${nextYear}-${nextMonth}-01`),
        },
      },
    },
    {
      $addFields: {
        categoryID: { $toObjectId: '$categoryID' },
        accountID: { $toObjectId: '$accountID' },
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
              description: '$$transaction.description',
              amount: '$$transaction.amount',
              account: {
                name: {
                  $arrayElemAt: ['$$transaction.account.name', 0],
                },
              },
              category: {
                name: {
                  $arrayElemAt: ['$$transaction.category.name', 0],
                },
                icon: {
                  $arrayElemAt: ['$$transaction.category.icon', 0],
                },
                color: {
                  $arrayElemAt: ['$$transaction.category.color', 0],
                },
                type: {
                  $arrayElemAt: ['$$transaction.category.type', 0],
                },
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

//all Transactions
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
        _id: 0,
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
              description: '$$transaction.description',
              amount: '$$transaction.amount',
              account: {
                name: {
                  $arrayElemAt: ['$$transaction.account.name', 0],
                },
              },
              category: {
                name: {
                  $arrayElemAt: ['$$transaction.category.name', 0],
                },
                icon: {
                  $arrayElemAt: ['$$transaction.category.icon', 0],
                },
                color: {
                  $arrayElemAt: ['$$transaction.category.color', 0],
                },
                type: {
                  $arrayElemAt: ['$$transaction.category.type', 0],
                },
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

  if (!mongoose.Types.ObjectId.isValid(accountID))
    return res.status(404).json({ error: 'No such account' });

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

    const account = await Account.findById(accountID);
    const account_newBalance = +account.balance - +amount;

    await Account.findOneAndUpdate(
      { _id: accountID },
      {
        balance: account_newBalance,
      }
    );

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

  //if account was changed, check if new account is valid
  if (req.body.accountID != null) {
    if (!mongoose.Types.ObjectId.isValid(req.body.accountID))
      return res.status(404).json({ error: 'No such account' });
  }

  //calculate amount difference and deduct from bank account if changed
  if (req.body.amount != null && req.body.accountID == null) {
    const transaction = await Transaction.findById(id);
    const account = await Account.findById(transaction.accountID);

    const amountDifference = Math.abs(transaction.amount - req.body.amount); //calculate difference between old and new amount

    if (transaction.amount >= req.body.amount)
      var newBalance = account.balance + amountDifference;
    else
      var newBalance = account.balance - amountDifference;

    await Account.findOneAndUpdate(
      { _id: transaction.accountID },
      {
        balance: newBalance,
      }
    );
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
  getSpecificTransactions,
  getTransactions,
  getTransaction,
  checkTransactionCreation,
  deleteTransaction,
  updateTransaction,
};
