var express = require('express');
var router = express.Router();
var jwtDecode = require('jwt-decode');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'

router.use(function (req, res, next) {
    var _id = req.headers.token
    var decoded = jwtDecode(_id);
    var id = decoded.sub
    console.log('FindPart By userId: ' + id)
    findPart().then(result => {
        var resultLength = result.length
        var stockList = []
        for (var i = 0; i < resultLength; i++) {
            var partListLength = result[i].partList.length
            for (var v = 0; v < partListLength; v++) {
                stockList.push(result[i].partList[v].materialno)
            }
        }
        stockList.sort()
        var sLength = stockList.length
        while (sLength--) {
            if (stockList[sLength] == stockList[sLength - 1]) {
                stockList.splice(sLength, 1)
            }
        }
        findStock(stockList).then(result => {
            console.log(result)
        }).catch(error => {
            console.log(error)
        })
        console.log(result)
    }).catch(error => {
        console.log(error)
    })
    res.end()
})

async function findPart() {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('part');
        let res = await collection.find({}).toArray()
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}
async function findStock(stockList) {
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
                "$in": stockList
            }
        }
        let res = await collection.find(query).toArray()
        return res
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}


module.exports = router;