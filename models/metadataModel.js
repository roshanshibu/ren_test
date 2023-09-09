const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const metadataSchema = new Schema({
  age: {
    days: { type: Number },
    hours: { type: Number },
    minutes: { type: Number },
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
  },
});

// This will create a collection named "Metadata" in the MongoDB database
module.exports = mongoose.model('Metadata', metadataSchema);
