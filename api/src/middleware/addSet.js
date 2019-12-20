var express = require('express');
var router = express.Router();
var jwtDecode = require('jwt-decode');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'

router.use(function (req, res, next) {
    var _id = req.body.token
    var decoded = jwtDecode(_id);
    var id = decoded.sub
    console.log('FindSet By userId: ' + id)
    var setName = req.body.setName
    var addArr = req.body.add
    var obj = {
        userId: id,
        setName: setName,
        setList: [],
    }
    for (var i = 0; i < addArr.length; i++) {
        var json = {
            partName: addArr[i].partName,
            value: addArr[i].value,
        }
        obj.setList.push(json)
    }
    console.log(obj)
    var setName = obj.setName
    findSet(setName).then(result => {
        if (result.length == 0) {
            addSet(obj).then(result => {
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

async function findSet(setName) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('set');
        let query = { setName: setName }
        let res = await collection.find(query).toArray()
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function addSet(obj) {
    console.log('Addset')
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('set');
        let res = await collection.insertOne(obj)
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

module.exports = router;