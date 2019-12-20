var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'

router.use(function (req, res, next) {
    console.log('Find Stock ALL')
    findStock().then(result => {
        res.json(result).end()
    }).catch(error => {
        console.log(error)
    })
})

async function findStock() {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('stock');
        let collection = db.collection('stock');
        let res = await collection.find({}).toArray()
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}


module.exports = router;