var fs = require('fs')
module.exports = {                      
    //'0 10 * * Monday-Friday', //TODO at 10:00 am (morning )
    //'*/10 * * * * *' // EVERY 10 SEC
    jobTime: '0 10 * * Monday-Friday', // EDIT JOB 
    dirStock: __dirname+  '/stock/' + fs.readdirSync(__dirname + '/stock') // EDIT PATH CSV FILE
}