var express = require('express');
var router = express.Router();
var jwtDecode = require('jwt-decode');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'
var ObjectID = require('mongodb').ObjectID;
router.use(function (req, res, next) {
    var _id = req.body.obj.token
    var decoded = jwtDecode(_id);
    var id = decoded.sub
    var obj = req.body.obj
    console.log('Edit Profile By userId: ' + id)
    editProfile(obj).then(result => {
        res.json(result).end()
    }).catch(error => {
        console.log(error)
    })
})

async function editProfile(obj) {
    var _id = obj.token
    var decoded = jwtDecode(_id);
    var id = decoded.sub
    var password = obj.password
    var firstname = obj.firstname
    var lastname = obj.lastname
    var email = obj.email
    var phone = obj.phone

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
                firstname: firstname, lastname: lastname,
                email: email, phone: phone
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