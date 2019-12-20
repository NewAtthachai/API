var express = require('express');
var router = express.Router();
var readExcel = require('../src/models/readExcel');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'
var ObjectID = require('mongodb').ObjectID;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/testjob', function (req, res, next) {
  readExcel.read()
  res.end()
});

router.get('/createdbstock', function (req, res, next) {
  // newdb is the new database we create
  var url = "mongodb://localhost:27017/stock";
  // create a client to mongodb
  var MongoClient = require('mongodb').MongoClient;
  // make client connect to mongo service
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("Database created!");
    var dbo = db.db("stock");
    dbo.createCollection("stock", function (err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  });
  res.end()
});

router.get('/createdbuser', function (req, res, next) {
  // newdb is the new database we create
  var url = "mongodb://localhost:27017/user";
  // create a client to mongodb
  var MongoClient = require('mongodb').MongoClient;
  // make client connect to mongo service
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("Database created!");
    var dbo = db.db("user");
    dbo.createCollection("part", function (err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
    dbo.createCollection("set", function (err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  });
  res.end()
});

router.get('/insertadmin', function (req, res, next) {
  var myobj = {
    username: 'admin',
    password: 'admin',
    position: 'Admin',
    phone: '0123456789',
    email: 'admin@admin.com',
    recent_login: '',
    firstname: 'FirstnameAdmin',
    lastname: 'LastnameAdmin',

  }
  addUsers(myobj).then(result => {
    var userId = result.insertedId
    console.log(userId)
    addList(userId).then(result => {
      console.log(result)
    }).catch(error => {
      console.log(error)
    })
  }).catch(error => {
    console.log(error)
  })
  res.end()
});

async function addUsers(myobj) {
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
    .catch(err => { console.log(err); });
  if (!client) {
    return;
  }
  try {
    const db = client.db('user');
    let collection = db.collection('user');
    let res = await collection.insertOne(myobj)
    return res
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}

async function addList(userId) {
  var obj = {
    userId: ObjectID(userId).toString()
  }
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
    .catch(err => { console.log(err); });
  if (!client) {
    return;
  }
  try {
    const db = client.db('user');
    let collection = db.collection('list');
    let res = await collection.insertOne(obj)
    return res
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}
module.exports = router;
