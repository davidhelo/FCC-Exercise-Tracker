require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const { userModel, exerciseModel } = require('./mongooseDB_connection.js')
const bodyParser = require('body-parser')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use('/api/users', bodyParser.urlencoded({extended: false}));

// create new USER form > POST /api/users
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

// add EXERCISE form > POST /api/users/:_id/exercises *****************************
app.use('/api/users/:_id/exercises', bodyParser.urlencoded({extended: false}));

function exercisesHandler(req, res) {
  //DELETE ALL EXERCISES -----------------------------------------
  /*exerciseModel.deleteMany({})
    .then((dataDelete) => {console.log(`All exercises deleted: ${dataDelete}`)})
    .catch((errDelete) => {console.log(errDelete)});*/
  //-------------------------------------------------------------
  
  // get username, find by id
  userModel.findById({ _id: req.body[':_id'] })
    .then((dataUser) => {
      console.log(dataUser);
      if (dataUser == null) {
        console.log("user id not found");
      } else {
        // set current date if a date not provided
        console.log(`date: ${req.body.date}`);
        let dateToRegister = undefined;
        if (req.body.date === '') {
          dateToRegister = new Date(Date.now());
        } else {
          dateToRegister = new Date(req.body.date);
        }

        //Create new exercise model instance to save
        let newExercise = new exerciseModel({
          username: dataUser.username,
          description: req.body.description,
          duration: parseInt(req.body.duration),
          date: dateToRegister.toDateString()
        });

        // save document
        newExercise.save()
          .then((dataExercise) => {
            let exerciseRegistered = {
              username: dataExercise.username,
              description: dataExercise.description,
              duration: dataExercise.duration,
              date: dataExercise.date.toDateString().split('T')[0],
              "_id": dataExercise._id
            };
            console.log("Exercise registered with data:");
            console.log(exerciseRegistered);
            res.json(exerciseRegistered);
          })
          .catch((errExercise) => {
            console.log(errExercise);
            res.send(errExercise);
          })
        }
    })
    .catch((error) => {
        console.log(error);
        res.send(error);
    }); 
};

app.post('/api/users/:_id/exercises', exercisesHandler);
// **************************************************
// api/users/:_id/logs

function logsHandler(req, res){
  console.log(`Id requested: ${req.params._id}`);
  let userId = req.params._id;
  userModel.findById({ "_id": userId })
  .select('username')
  .then((dataLogs) => {
    // if no document found it returns null
    if (dataLogs == null) { res.send("user not found"); }
    console.log("Username found: ");
    console.log(dataLogs);
    // query to count documents with the user name found
    let documentsCount = null;
    exerciseModel.find({ username: dataLogs.username })
      .countDocuments({})
      .then((count) => { 
        documentsCount = count; 
        console.log(`Dcouments counted: ${documentsCount}`);
        
        // query to get all the logs with user name found
        exerciseModel.find({ username: dataLogs.username })
          .select('-_id description duration date')
          .then((dataLogsExercises) => {
            console.log(`Exercises found for id: ${userId}`);
            let logResponse = {
                username: dataLogs.username,
                count: documentsCount,
                _id: dataLogs._id,
                log: dataLogsExercises.map(log => { // it maps the array to format the date
                  return {
                        description: log.description,
                        duration: log.duration,
                        date: log.date.toDateString().split('T')[0] 
                  };
                })
              };
            console.log(logResponse);
            res.json(logResponse);
          })
          .catch((errLogsExercises) => {
            console.log(errLogsExercises);
            res.send(errLogsExercises);
          });
      })
      .catch((errCount) => { console.log(errCount) });
  })
  .catch((errLogs) => {
    console.log(errLogs);
    res.send(errLogs);
  });
};

app.get('/api/users/:_id/logs', logsHandler);
// API > GET /api/users/:_id/logs?[from][&to][&limit]


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
