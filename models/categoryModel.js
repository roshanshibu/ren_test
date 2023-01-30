const mongoose = require('mongoose');

var categorySchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    accountID: { type: String, required: true },
    userID: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
