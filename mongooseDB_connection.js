const mongoose = require('mongoose');

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

// mongoose schema
let userSchema = new mongoose.Schema({
  username: String
});

let userModel = mongoose.model('userModel', userSchema);

exports.userModel = userModel;