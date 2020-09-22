var express = require('express');
var router = express.Router();
var { url, mongodClient, JWT_SECRET } = require("../db/key")
const bcryptjs = require("bcrypt")
const jwt = require("jsonwebtoken")


router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/', async function (req, res, next) {
    let client;
    try {
        client = await mongodClient.connect(url)
        let db = client.db("zen")

        let user = await db.collection("users").findOne({ email: req.body.email })
        console.log(user)
        if (user) {

            let result = await bcryptjs.compare(req.body.password, user.password)
            if (result) {
                let token = jwt.sign({ id: user._id }, JWT_SECRET)
                res.json({
                    message: "LoggedIN Successfull",
                    token
                })
            }
            else {
                res.json({
                    message: "UserName or Password is Incorrect"
                })
            }


        }

        else {
            res.json({
                message: "Incorrect Email"
            })
        }
        client.close()

        res.end()
    }
    catch (error) {
        client.close()
        console.log(error)
    }
});

module.exports = router;
