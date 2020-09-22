var express = require('express');
var router = express.Router();
var { url, mongodClient } = require("../db/key")
const bcryptjs = require("bcrypt")


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/', async function (req, res, next) {
    let client;
    try {
        client = await mongodClient.connect(url)
        let db = client.db("zen")
        let email= req.body.email;
        let password = req.body.password
        let salt = await bcryptjs.genSalt(10)
        let hash = await bcryptjs.hash(req.body.password, salt)
        password = hash
        await db.collection("users").insertOne({
            email,
            password,
            
        })



        client.close()
        res.json({
            message: "Success"
        })

        res.end()
    }

    catch (error) {
        client.close()
        console.log(error)
    }
});

module.exports = router;
