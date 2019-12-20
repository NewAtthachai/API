var express = require('express');
var router = express.Router();
var jwtDecode = require('jwt-decode');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'

router.use(function (req, res, next) {
    console.log('Find Part By canUse: true')
    findPartCanUse().then(result => {
        res.json(result).end()
    }).catch(error => {
        console.log(error)
    })
})

async function findPartCanUse() {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('part');
        let query = { canUse: { $eq: true } }
        let res = await collection.find(query).toArray()
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

module.exports = router;