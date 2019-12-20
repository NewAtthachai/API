var fs = require('fs')
var csv = require('csvtojson')
var sortBy = require('array-sort-by')
var script = require('../script')
var d = new Date()
var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var url = 'mongodb://localhost:27017/'
var dbName = 'stock'
var ObjectID = require('mongodb').ObjectID;
module.exports = {
    read: function () {
        readFunction().then(result => {
            console.log('START READ CSV FILE')
            console.log('time now is: ' + d + '\n read rows total: ' + result.length)
            var material = []
            for (var i = 0; i < result.length; i++) {
                material.push(result[i].Materialno)
            }
            material.sort()
            var i = material.length
            while (i--) {
                if (material[i] == material[i - 1])
                    material.splice(i, 1)
            }
            var obj = {
                materialList: [],
                excelData: []
            }
            obj.materialList = material
            obj.excelData = result
            findMaterial(obj).then(result => {
                mergeArr(result)
            }).catch(error => {
                console.log(error)
            })
        }).catch(error => {
            console.log(error)
        })
    },
};

async function readFunction() {
    var fileName = script.dirStock
    csv()
        .fromFile(fileName)
        .then((jsonObj) => {
            var result = sortBy(jsonObj, item => item.Materialno);
            var i = result.length
            while (i--) {
                var values = Object.values(result[i])
                var valuesLength = values.length
                for (var f = 0; f < valuesLength; f++) {
                    if (values[f] == '') {
                        result.splice(i, 1)
                        f = valuesLength
                    }
                }
            }
        })
    const readResult = await csv().fromFile(fileName);
    return readResult
}


async function findMaterial(obj) {
    var obj = obj
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

function mergeArr(obj) {
    var obj = obj
    var excelData = obj.excelData
    var materialAll = obj.materialAll
    for (var i = 0; i < excelData.length; i++) {
        for (var v = 0; v < materialAll.length; v++) {
            if (excelData[i].Materialno == materialAll[v].materialno) {
                for (var p = 0; p < materialAll[v].plant.length; p++) {
                    if (excelData[i].Plant == materialAll[v].plant[p].plantnumber
                        && excelData[i].SLoc == materialAll[v].plant[p].sloc
                        && excelData[i].SlocDesc == materialAll[v].plant[p].slocdesc) {
                        materialAll[v].plant[p].unrestrictuse = parseInt(excelData[i].Unrestrictuse)
                        materialAll[v].plant[p].reserve = parseInt(excelData[i].Reserve)
                        materialAll[v].plant[p].exporttime = excelData[i].Exporttime
                        excelData[i].Materialno = 'delete'
                    }
                }
                if (excelData[i].Materialno != 'delete') {
                    var objPart = {
                        plantnumber: excelData[i].Plant,
                        sloc: excelData[i].SLoc,
                        slocdesc: excelData[i].SlocDesc,
                        unrestrictuse: parseInt(excelData[i].Unrestrictuse),
                        reserve: parseInt(excelData[i].Reserve),
                        exporttime: excelData[i].Exporttime,
                    }
                    var materialPlant = materialAll[v].plant
                    materialPlant.push(objPart)
                    excelData[i].Materialno = 'delete'
                }
                v = materialAll.length
            }
        }
    }
    var i = excelData.length
    while (i--) {
        if (excelData[i].Materialno == 'delete') {
            excelData.splice(i, 1)
        }
    }
    if (excelData.length != 0) {
        addDb(excelData)
    }
    var update = obj.materialAll
    updateDb(update)
}

function updateDb(update) {
    var update = update
    for (var i = 0; i < update.length; i++) {
        update[i].totalunrestrictuse = 0
        update[i].totalreserve = 0
        for (var v = 0; v < update[i].plant.length; v++) {
            if (update[i].plant[v].slocdesc == 'Installation') {
                update[i].totalunrestrictuse += update[i].plant[v].unrestrictuse
                update[i].totalreserve += update[i].plant[v].reserve
            }
        }
        update[i].totaltouse = update[i].totalunrestrictuse - update[i].totalreserve
        if (update[i].totaltouse >= update[i].max) {
            update[i].color = 'green'
        } else if (update[i].totaltouse > update[i].min) {
            update[i].color = 'yellow'
        } else {
            update[i].color = 'red'
        }
    }
    MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        const db = client.db(dbName);
        for (var i = 0; i < update.length; i++) {
            var materialno = update[i].materialno
            var myquery = { materialno: materialno };
            var newvalues = {
                $set: {
                    color: update[i].color,
                    totaltouse: update[i].totaltouse,
                    totalunrestrictuse: update[i].totalunrestrictuse,
                    totalreserve: update[i].totalreserve,
                    datemodified: d.toDateString(),
                    plant: update[i].plant,
                }
            };
            update[i].materialno
            db.collection('stock').updateOne(myquery, newvalues, function (err, result) {
                if (err) throw err;
                console.log('complete')
            });
        }
        client.close()
    });
}

function addDb(excelData) {
    var excelData = excelData
    var arrData = []
    var obj = {
        materialno: excelData[0].Materialno,
        color: 'grey',
        min: 0,
        max: 0,
        totaltouse: 0,
        totalunrestrictuse: 0,
        totalreserve: 0,
        datemodified: d.toDateString(),
        plant: [{
            plantnumber: excelData[0].Plant,
            sloc: excelData[0].SLoc,
            slocdesc: excelData[0].SlocDesc,
            unrestrictuse: parseInt(excelData[0].Unrestrictuse),
            reserve: parseInt(excelData[0].Reserve),
            exporttime: excelData[0].Exporttime,
        }]
    }
    arrData.push(obj)

    for (var i = 1; i < excelData.length; i++) {
        var arrLength = arrData.length
        for (var v = 0; v < arrLength; v++) {
            if (excelData[i].Materialno == arrData[v].materialno) {
                var pushItem = {
                    plantnumber: excelData[i].Plant,
                    sloc: excelData[i].SLoc,
                    slocdesc: excelData[i].SlocDesc,
                    unrestrictuse: parseInt(excelData[i].Unrestrictuse),
                    reserve: parseInt(excelData[i].Reserve),
                    exporttime: excelData[i].Exporttime,
                }
                var plantArrData = arrData[v].plant
                plantArrData.push(pushItem)
                v = arrLength
            } else {
                var obj = {
                    materialno: excelData[i].Materialno,
                    color: 'grey',
                    min: 0,
                    max: 0,
                    totaltouse: 0,
                    totalunrestrictuse: 0,
                    totalreserve: 0,
                    datemodified: d.toDateString(),
                    plant: [{
                        plantnumber: excelData[i].Plant,
                        sloc: excelData[i].SLoc,
                        slocdesc: excelData[i].SlocDesc,
                        unrestrictuse: parseInt(excelData[i].Unrestrictuse),
                        reserve: parseInt(excelData[i].Reserve),
                        exporttime: excelData[i].Exporttime,
                    }]
                }
                arrData.push(obj)
                v = arrLength
            }
        }
    }
    console.log(arrData)
    MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        const db = client.db(dbName);
        db.collection('stock').insertMany(arrData, function (err, res) {
            if (err) throw err;
            console.log("Number of documents inserted: " + res.insertedCount);
            client.close()
        });
    });
}