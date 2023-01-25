const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const accountSchema = new Schema(
  {
    name: { type: String, required: true },
    accounttype: { type: String, required: true },
    userID: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    colorhex: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

//model automatically creates a Accounts collection in the db
module.exports = mongoose.model('Account', accountSchema);

//find accounts within accounts collection
//Account.find()
