const Dashboard = require('../models/dashboardModel');
const Transaction = require('../models/transactionModel');
const Account = require('../models/accountModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');

const mongoose = require('mongoose');
const { getTransactions } = require('./transactionController');
const { json } = require('express');

//GET dashboard
const getDashboard = async (req, res) => {
  const dashboard_temp = await calcDashboard(req.headers.jwt.userId);

  //reduce currency, totalBalance, totalIncome & totalExpense into single array
  var dashboard = dashboard_temp.slice(0, 3).reduce(function (acc, curr) {
    if (curr && curr[0]) {
      Object.keys(curr[0]).forEach(function (key) {
        if (key !== '_id') {
          acc[key] = curr[0][key];
        }
      });
    }
    return acc;
  }, {});
  //add results array to dashboard
  if (dashboard_temp[3].length > 0)
    dashboard.top3Categories = dashboard_temp[3];

  res.status(200).json(dashboard);
};

async function calcDashboard(UserID) {
  //Total Balance pipeline

  const agg1 = await Account.aggregate([
    {
      $match: { userID: { $eq: UserID } },
    },
    {
      $addFields: { userID: { $toObjectId: '$userID' } },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userID',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $unwind: '$users',
    },
    {
      $group: {
        _id: null,
        currency: { $first: '$users.currency' },
        totalBalance: { $sum: '$balance' },
      },
    },
    // {
    //   $project: {
    //     totalBalance: '$totalBalance',
    //     currency: '$currency',
    //   },
    // },
  ]);

  //total income and total expense pipeline
  const agg2 = await // Aggregation pipeline for total income
  Transaction.aggregate([
    {
      $match: { userID: { $eq: UserID }, type: 'Income' },
    },
    {
      $match: {
        $expr: {
          $and: [
            {
              $gte: [
                '$createdAt',
                new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              ],
            },
            {
              $lt: [
                '$createdAt',
                new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() + 1,
                  1
                ),
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: '$amount' },
      },
    },
  ]);

  // Aggregation pipeline for total expenses
  const agg3 = await Transaction.aggregate([
    {
      $match: { userID: { $eq: UserID }, type: 'Expense' },
    },
    {
      $match: {
        $expr: {
          $and: [
            {
              $gte: [
                '$createdAt',
                new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              ],
            },
            {
              $lt: [
                '$createdAt',
                new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() + 1,
                  1
                ),
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalExpense: { $sum: '$amount' },
      },
    },
  ]);

  //top3Categories with others pipeline
  var agg4 = await Transaction.aggregate([
    {
      $match: {
        userID: { $eq: UserID },
        type: 'Expense',
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    },
    {
      $addFields: { categoryID: { $toObjectId: '$categoryID' } },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryID',
        foreignField: '_id',
        as: 'category_info',
      },
    },
    {
      $unwind: '$category_info',
    },
    {
      $group: {
        _id: '$category_info.name',
        icon: { $first: '$category_info.icon' },
        color: { $first: '$category_info.color' },
        amount: { $sum: '$amount' },
      },
    },
    {
      $sort: {
        amount: -1,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        data: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        results: {
          $map: {
            input: {
              $slice: ['$data', 3],
            },
            in: {
              Rank: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $eq: [{ $indexOfArray: ['$data', '$$this'] }, 0],
                      },
                      then: 'first',
                    },
                    {
                      case: {
                        $eq: [{ $indexOfArray: ['$data', '$$this'] }, 1],
                      },
                      then: 'second',
                    },
                    {
                      case: {
                        $eq: [{ $indexOfArray: ['$data', '$$this'] }, 2],
                      },
                      then: 'third',
                    },
                  ],
                  default: '',
                },
              },
              Name: '$$this._id',
              Icon: '$$this.icon',
              Color: '$$this.color',
              Percentage: {
                $round: {
                  $multiply: [{ $divide: ['$$this.amount', '$total'] }, 100],
                },
              },
            },
          },
        },
        Others: {
          $cond: {
            if: { $gt: [{ $size: '$data' }, 3] },
            then: {
              Name: 'Others',
              Amount: {
                $subtract: [
                  '$total',
                  {
                    $sum: {
                      $slice: ['$data.amount', 3],
                    },
                  },
                ],
              },
              Percentage: {
                $round: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $subtract: [
                            '$total',
                            { $sum: { $slice: ['$data.amount', 3] } },
                          ],
                        },
                        '$total',
                      ],
                    },
                    100,
                  ],
                },
              },
              Icon: 'others',
              Color: '#26a69a',
            },
            else: {
              Amount: null,
              Percentage: null,
            },
          },
        },
      },
    },
  ]);

  if (agg4.length > 0) {
    const agg5 = agg4[0].results;
    agg5.push(agg4[0].Others);

    const res = [agg1, agg2, agg3, agg5];
    return res;
  }

  const res = [agg1, agg2, agg3, agg4];
  return res;
}

module.exports = {
  getDashboard,
};
