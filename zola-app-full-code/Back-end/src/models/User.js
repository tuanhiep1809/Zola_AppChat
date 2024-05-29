const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
  },
  email: {
    type: String,
  },
  number: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  avatar: {
    type: String,
  },
  background: {
    type: String,
  },
  logoutTime: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);