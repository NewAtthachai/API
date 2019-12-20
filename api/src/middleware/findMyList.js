var express = require('express');
var router = express.Router();
var jwtDecode = require('jwt-decode');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'

router.use(function (req, res, next) {
    var _id = req.headers.token
    var decoded = jwtDecode(_id);
    var id = decoded.sub
    console.log('Find By userId: ' + id)
    findMyList(id).then(result => {
        // check result.listimportant OR result.listnormal == null ? if null next()
        findListImportant(result).then(result => {
            findListNormal(result).then(result => {
                console.log('Success')
                res.json(result).end()
            }).catch(error => {
                console.log(error)
            })
        }).catch(error => {
            console.log(error)
        })
    }).catch(error => {
        console.log(error)
    })
})

async function findMyList(id) {
    var id = id
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('list');
        let query = { userId: id }
        let res = await collection.findOne(query);
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function findListImportant(obj) {
    var listImportant = obj.listimportant
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('stock');
        let collection = db.collection('stock');
        let query = {
            materialno: {
                "$in": listImportant
            }
        }
        let res = await collection.find(query).toArray()
        obj.listall = []
        var resLength = res.length
        for (var i = 0; i < resLength; i++) {
            res[i].composition = 'important'
            obj.listall.push(res[i])
        }
        return obj
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function findListNormal(obj) {
    var listNormal = obj.listnormal
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('stock');
        let collection = db.collection('stock');
        let query = {
            materialno: {
                "$in": listNormal
            }
        }
        let res = await collection.find(query).toArray()
        var resLength = res.length
        for (var i = 0; i < resLength; i++) {
            res[i].composition = 'normal'
            obj.listall.push(res[i])
        }
        return obj
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}


module.exports = router;