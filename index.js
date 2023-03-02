require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const { userModel } = require('./mongooseDB_connection.js')
const bodyParser = require('body-parser')


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// create new USER form > POST /api/users
app.use('/api/users', bodyParser.urlencoded({extended: false}));

function newUserHandler (req, res) {
  let newUser = new userModel({
    username: req.body.username
  });
  
  newUser.save()
    .then((data) => {
      console.log(data);
      res.json({
        usename: data.username,
        _id: data._id
      });
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
};

app.post('/api/users', newUserHandler);

function retrieveUsersHandler (req, res){
  userModel.find({}).select('username _id')
    .then((data) => {
      res.json(data);
    })
  .catch((error) => {
      console.log(error);
      res.send(error);
  });
};

app.get('/api/users', retrieveUsersHandler);

// add EXERCISE form > POST /api/users/:_id/exercises


// API > GET /api/users/:_id/logs?[from][&to][&limit]


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
