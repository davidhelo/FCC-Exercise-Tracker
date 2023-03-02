const mongoose = require('mongoose');

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

// mongoose schema
let userSchema = new mongoose.Schema({
  username: String
});

let exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
});

let userModel = mongoose.model('userModel', userSchema);
let exerciseModel = mongoose.model('exerciseModel', exerciseSchema);

exports.userModel = userModel;
exports.exerciseModel = exerciseModel;