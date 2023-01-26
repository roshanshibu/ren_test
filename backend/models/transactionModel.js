const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    accountID: {
      type: String,
      required: true,
    },
    fromAccountID: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    categoryID: {
      type: String,
      required: false,
    },
    accountID: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//model automatically creates a Transactions collection in the db
module.exports = mongoose.model('Transaction', transactionSchema);

//find transactions within transactions collection
//Transaction.find()
