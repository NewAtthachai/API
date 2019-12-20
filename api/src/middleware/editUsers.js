var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'
var ObjectID = require('mongodb').ObjectID;

router.use(function (req, res, next) {
    var obj = req.body
    var id = req.body.edit.id
    console.log('Edit Users By userId: ' + id)
    editUsers(obj).then(result => {
        res.json(result).end()
        console.log(result)
    }).catch(error => {
        console.log(error)
    })
})

async function editUsers(obj) {
    var id = obj.edit.id
    var password = obj.edit.password
    var firstname = obj.edit.firstname
    var lastname = obj.edit.lastname
    var email = obj.edit.email
    var phone = obj.edit.phone
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db('user');
        let collection = db.collection('user');
        let query = { _id: new ObjectID(id) }
        var newvalues = {
            $set: {
                password: password,
                firstname: firstname,
                lastname: lastname,
                email: email,
                phone: phone
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