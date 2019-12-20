var express = require('express');
var router = express.Router();
var jwtDecode = require('jwt-decode');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'

router.use(function (req, res, next) {
    var _id = req.body.token
    var decoded = jwtDecode(_id);
    var id = decoded.sub
    console.log('AddList By userId: ' + id)
    var add = req.body.add
    var listImportant = []
    var listNormal = []
    for (var i = 0; i < add.length; i++) {
        if (add[i].composition == true) {
            listImportant.push(add[i].materialno)
        } else {
            listNormal.push(add[i].materialno)
        }
    }
    var objAdd = {
        userId: id,
        listimportant: listImportant,
        listnormal: listNormal,
    }
    findList(id).then(result => {
        if (result[0].listimportant == undefined) {
            addList(objAdd).then(result => {
                res.json(result).end()
            }).catch(error => {
                console.log(error)
            })
        } else {
            var list = result[0]
            var newListIm = objAdd.listimportant
            var newListNor = objAdd.listnormal
            for (var i = 0; i < newListIm.length; i++) {
                list.listimportant.push(newListIm[i])
            }
            for (var i = 0; i < newListNor.length; i++) {
                list.listnormal.push(newListNor[i])
            }
            list.listimportant.sort()
            list.listnormal.sort()
            var i = list.listimportant.length
            while (i--) {
                if (list.listimportant[i] == list.listimportant[i - 1])
                    list.listimportant.splice(i, 1)
            }
            var i = list.listnormal.length
            while (i--) {
                if (list.listnormal[i] == list.listnormal[i - 1])
                    list.listnormal.splice(i, 1)
            }
            objAdd.listimportant = list.listimportant
            objAdd.listnormal = list.listnormal
            addList(objAdd).then(result => {
                res.json(result).end()
            }).catch(error => {
                console.log(error)
            })
        }
    }).catch(error => {
        console.log(error)
    })
})

async function findList(id) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('list');
        let query = { userId: id }
        let res = await collection.find(query).toArray()
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function addList(obj) {
    var userId = obj.userId
    var listimportant = obj.listimportant
    var listnormal = obj.listnormal
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('list');
        var myquery = { "userId": userId };
        var newvalues = { $set: { 'listnormal': listnormal, 'listimportant': listimportant, } };
        let res = await collection.updateOne(myquery, newvalues)
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

module.exports = router;