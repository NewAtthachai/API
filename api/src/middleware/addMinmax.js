var express = require('express');
var router = express.Router();
var jwtDecode = require('jwt-decode');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'
var ObjectID = require('mongodb').ObjectID;
router.use(function (req, res, next) {
    var obj = {
        materialno: req.body.materialno,
        min: req.body.min,
        max: req.body.max,
    }
    console.log('AddMinmax By Material no: ' + obj.materialno)
    addMinmax(obj).then(result => {
        res.json(result).end()
    }).catch(error => {
        console.log(error)
    })
})

async function addMinmax(obj) {
    var materialno = obj.materialno
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('stock');
        let collection = db.collection('stock');
        let query = { materialno: materialno }
        let newvalues = {
            $set: {
                min: obj.min,
                max: obj.max,
            }
        };
        let res = await collection.updateOne(query, newvalues)
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

module.exports = router;