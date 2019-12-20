var express = require('express');
var router = express.Router();
var jwtDecode = require('jwt-decode');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'

router.use(function (req, res, next) {
    var _id = req.body.token
    var decoded = jwtDecode(_id);
    var id = decoded.sub
    console.log('Add Part By userId: ' + id)
    var obj = {
        userId: id,
        partName: req.body.partName,
        canUse: true,
        partList: []
    }
    var addArr = req.body.add
    var addLength = req.body.add.length
    for (var i = 0; i < addLength; i++) {
        var arr = {
            materialno: addArr[i].materialno,
            value: addArr[i].value,
        }
        obj.partList.push(arr)
    }
    var partName = obj.partName

    findPart(partName).then(result => {
        if (result.length == 0) {
            addPart(obj).then(result => {
                res.json(result).end()
            }).catch(error => {
                console.log(error)
            })
        } else {
            return next('router')
        }
    }).catch(error => {
        console.log(error)
    })
})

async function findPart(partName) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('part');
        let query = {
            partName: partName
        }
        let res = await collection.find(query).toArray()
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function addPart(obj) {
    console.log(obj)
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('part');
        let res = await collection.insertOne(obj)
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}


module.exports = router;