const Dashboard = require('../models/dashboardModel');
const Transaction = require('../models/transactionModel');
const Account = require('../models/accountModel');
const Category = require('../models/categoryModel');

const mongoose = require('mongoose');
const { getTransactions } = require('./transactionController');

//GET dashboard
const getDashboard = async (req, res) => {
  const dashboard = await calcDashboard(req.headers.jwt.userId);

  res.status(200).json(dashboard);
};

async function calcDashboard(UserID) {
  //Total Balance pipeline
  const agg1 = await Account.aggregate([
    {
      $match: { userID: { $eq: UserID } },
    },
    {
      $group: {
        _id: null,
        totalBalance: { $sum: '$balance' },
      },
    },
  ]);

  //total income and total expense pipeline
  const agg2 = await Transaction.aggregate([
    {
      $match: { userID: { $eq: UserID } },
    },
    {
      $match: {
        type: { $in: ['Income', 'Expense', 'Transfer'] },
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
        _id: { type: '$type' },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  //top3Categories with others pipeline
  const agg3 = await Transaction.aggregate([
    {
      $match: {
        userID: { $eq: UserID },
        type: 'Expense',
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
              category: '$$this._id',
              percentage: {
                $round: {
                  $multiply: [{ $divide: ['$$this.amount', '$total'] }, 100],
                },
              },
            },
          },
        },
        others: {
          $cond: {
            if: { $gt: [{ $size: '$data' }, 3] },
            then: {
              amount: {
                $subtract: [
                  '$total',
                  {
                    $sum: {
                      $slice: ['$data.amount', 3],
                    },
                  },
                ],
              },
              percentage: {
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
            },
            else: {
              amount: null,
              percentage: null,
            },
          },
        },
      },
    },
  ]);

  const res = [agg1, agg2, agg3];

  return res;
}

module.exports = {
  getDashboard,
};
