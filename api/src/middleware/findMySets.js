var express = require('express');
var router = express.Router();
var jwtDecode = require('jwt-decode');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'

router.use(function (req, res, next) {
    var _id = req.headers.token
    var decoded = jwtDecode(_id);
    var id = decoded.sub
    console.log('Find My Sets By userId: ' + id)
    findMySet(id).then(result => {
        var partName = []
        var obj = {
            setList: [],
            partList: [],
        }
        obj.setList = result
        for (var i = 0; i < result.length; i++) {
            for (var v = 0; v < result[i].setList.length; v++) {
                partName.push(result[i].setList[v].partName)
            }
        }
        partName.sort()
        var pLength = partName.length
        while (pLength--) {
            if (partName[pLength] == partName[pLength - 1]) {
                partName.splice(pLength, 1)
            }
        }
        obj.partList = partName
        findMyPart(obj).then(result => {
            var materialList = []
            var partAll = result.partAll
            for (var i = 0; i < partAll.length; i++) {
                for (var v = 0; v < partAll[i].partList.length; v++) {
                    materialList.push(partAll[i].partList[v].materialno)
                }
            }
            materialList.sort()
            var pLength = materialList.length
            while (pLength--) {
                if (materialList[pLength] == materialList[pLength - 1]) {
                    materialList.splice(pLength, 1)
                }
            }
            result.materialList = materialList
            findMyMaterial(result).then(result => {
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

async function findMySet(id) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('set');
        let query = { userId: id }
        let res = await collection.find(query).toArray()
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function findMyPart(obj) {
    var partName = obj.partList
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('part');
        let query = {
            partName: {
                "$in": partName
            }
        }
        let res = await collection.find(query).toArray()
        obj.partAll = res
        return obj
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function findMyMaterial(obj) {
    var materialList = obj.materialList
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
                "$in": materialList
            }
        }
        let res = await collection.find(query).toArray()
        obj.materialAll = res
        return obj
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

module.exports = router;