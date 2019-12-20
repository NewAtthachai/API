var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var jwt = require("jwt-simple");
var urlMongodb = 'mongodb://localhost:27017/'
var dbName = 'user'
var SECRET = "MY_SECRET_KEY"
var date = new Date()
var result
var id
router.use(function (req, res, next) {
    var username = req.body.auth.username
    var password = req.body.auth.password
    console.log(username)
    console.log(password)
    MongoClient.connect(urlMongodb, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }, function (err, client) {
        var db = client.db(dbName);
        db.collection('user').find({
            $and: [
                { username: username }, { password: password }
            ]
        }).toArray(function (err, res) {
            if (err) throw err;
            if (res.length == 0) return next('router')
            result = {
                token: jwt.encode(payload = {
                    sub: res[0]._id,
                    iat: new Date().getTime()
                }, SECRET),
                position: res[0].position,
            }
            id = res[0]._id
            next()
        });
    });
})

router.use(function (req, res, next) {
    console.log(result)
    console.log(id)
    var myquery = { "_id": id };
    var newvalues = { $set: { 'recent_login': date.toDateString() } };
    MongoClient.connect(urlMongodb, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }, function (err, client) {
        var db = client.db(dbName);
        db.collection('user').updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
        })
        client.close()
    });
    res.json({ result: result }).end()
})

module.exports = router;