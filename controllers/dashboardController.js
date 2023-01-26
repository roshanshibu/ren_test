const Dashboard = require('../models/dashboardModel');
const Transaction = require('../models/transactionModel');
const Account = require('../models/accountModel');
const Category = require('../models/categoryModel');

const mongoose = require('mongoose');

//GET dashboard
const getDashboard = async (req, res) => {
  const dashboard = await calcDashboard();

  res.status(200).json(dashboard);
};

async function calcDashboard() {
  //Total Balance pipeline
  const agg1 = await Account.aggregate([
    {
      $group: {
        _id: null,
        totalBalance: { $sum: '$balance' },
      },
    },
  ]);

  //total income and total expense pipeline
  const agg2 = await Category.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        type: '$_id',
        totalAmount: 1,
      },
    },
  ]);

  //top3Categories with others pipeline
  const agg3 = await Category.aggregate([
    {
      $match: {
        type: 'expense',
      },
    },
    // {
    //   $group: {
    //     _id: '$name',
    //     amount: { $sum: '$amount' },
    //   },
    // },
    {
      $group: {
        _id: null,
        totalExpense: { $sum: '$amount' },
        categories: {
          $push: {
            name: '$name',
            amount: '$amount',
            icon: '$icon',
            color: '$color'
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        categories: {
          $map: {
            input: '$categories',
            as: 'category',
            in: {
              name: '$$category.name',
              percent: { $round: { $multiply: [{ $divide: ['$$category.amount', '$totalExpense'] }, 100] } },
              icon: '$$category.icon',
              color: '$$category.color'
            },
          },
        },
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $sort: { 'categories.percent': -1 },
    },
    {
      $group: {
        _id: null,
        categories: { $push: '$categories' },
      },
    },
    {
      $project: {
        first: { $arrayElemAt: [{ $slice: ['$categories', 0, 1] }, 0] },
        second: { $arrayElemAt: [{ $slice: ['$categories', 1, 1] }, 0] },
        third: { $arrayElemAt: [{ $slice: ['$categories', 2, 1] }, 0] },
        others: {
          $subtract: [
            100,
            {
              $sum: [
                { $arrayElemAt: ['$categories.percent', 0] },
                { $arrayElemAt: ['$categories.percent', 1] },
                { $arrayElemAt: ['$categories.percent', 2] },
              ],
            },
          ],
        },
      },
    },
  ]);

  const res = [agg1,agg2,agg3]

  return res;
}

module.exports = {
  getDashboard,
};
