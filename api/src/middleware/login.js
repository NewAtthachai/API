var express = require('express');
var router = express.Router();
var jwtDecode = require('jwt-decode');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'
var ObjectID = require('mongodb').ObjectID;
router.use(function (req, res, next) {
    var _id = req.headers.token
    var decoded = jwtDecode(_id);
    var id = decoded.sub

    console.log('Login By userId: ' + id)
    findProfile(id).then(result => {
        res.json(result).end()
        console.log(result)
    }).catch(error => {
        console.log(error)
    })
})

async function findProfile(id) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('user');
        let query = { _id: new ObjectID(id) }
        let res = await collection.find(query).toArray()
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

module.exports = router;