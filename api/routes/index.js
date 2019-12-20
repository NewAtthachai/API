var express = require('express');
var router = express.Router();
var readExcel = require('../src/models/readExcel');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/testjob', function (req, res, next) {
  readExcel.read()
  res.end()
});

module.exports = router;
