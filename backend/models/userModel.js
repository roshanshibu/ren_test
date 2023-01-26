const mongoose = require('mongoose');

var userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: 'This field is required' },
    lastname: { type: String, required: 'This field is required' },
    password: { type: String, required: 'This field is required' },
    email: { type: String, required: 'This field is required', unique: true },
    currency: { type: String, required: 'This field is required' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
