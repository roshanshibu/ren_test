const mongoose = require('mongoose');

var categorySchema = new mongoose.Schema(
  {
    ctype: { type: String },
    cname: { type: String },
    userID: { type: String },
    iconID: { type: String },
    colorhex: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
