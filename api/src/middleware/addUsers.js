var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'
var ObjectID = require('mongodb').ObjectID;

router.use(function (req, res, next) {
    console.log('Add Users')
    var myobj = {
        username: req.body.edit.username,
        password: req.body.edit.password,
        firstname: req.body.edit.firstname,
        lastname: req.body.edit.lastname,
        position: req.body.edit.position,
        email: req.body.edit.email,
        phone: req.body.edit.phone,
        recent_login: "",
    };
    findUsers().then(result => {
        var status = true
        for (var i = 0; i < result.length; i++) {
            if (result[i].username == myobj.username) {
                status = false
            }
        }
        if (status == true) {
            addUsers(myobj).then(result => {
                var userId = result.insertedId
                addList(userId).then(result => {
                    console.log(result)
                }).catch(error => {
                    console.log(error)
                })
            }).catch(error => {
                console.log(error)
            })
        } else {
            next('router')
        }
    }).catch(error => {
        console.log(error)
    })
    res.end()
})

async function findUsers() {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('user');
        let res = await collection.find({}).toArray()
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

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