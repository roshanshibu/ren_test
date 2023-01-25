const mongoose = require('mongoose');

var acctypeSchema = new mongoose.Schema(
  {
    type: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Acctype', acctypeSchema);
