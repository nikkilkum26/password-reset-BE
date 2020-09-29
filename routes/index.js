var express = require('express');
var router = express.Router();
var mongodb = require("mongodb")
var { url, mongodClient } = require("../db/key")
var nodemailer = require("nodemailer")
const sendgridT = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const Cryptr = require('cryptr');
const { getMaxListeners } = require('../app');
const cryptr = new Cryptr('myTotalySecretKey');
// const transporter = nodemailer.createTransport(sendgridT({
//   auth: {
//     api_key: "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"
//   }
// }))
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sndmail26@gmail.com', // generated ethereal user
    pass: 'sendmailtoeveryone', // generated ethereal password
  },
});


router.post('/forgot_password', async function (req, res, next) {
  let client;
  try {
    client = await mongodClient.connect(url)
    let db = client.db("zen")
    let user = await db.collection("users")
      .findOne({ email: req.body.email })
    let userId = user._id
    let email = req.body.email;

    if (user) {
      crypto.randomBytes(32, (error, Buffer) => {
        if (error) {
          console.log(error)
        }

        const passreset = Buffer.toString("hex");
       
        
        db.collection("users").findOneAndUpdate({ email: req.body.email }, { $set: { reset_token: passreset } })
        const encryptedString = cryptr.encrypt(email);
        let reset_url = `https://nikkil-nodejs-password-reset.netlify.app/reset.html/#access_token=${encryptedString}&`
         sendMail={
          from: 'sndmail26@gmail.com',
          to: req.body.email,
          subject: 'Password reset',
          text: `password reset Link ${reset_url}`
        };


        transporter.sendMail(sendMail, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            res.json({
              message: "Email Sent"
            })
          }
        });
      })
    }
    else {
      res.status(404).json({
        message: "Invalid user"
      })
      client.close()
      res.end()
    }

  }

  catch (error) {
    client.close()
    console.log(error)
  }
});


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.put('/reset/:email', async function (req, res) {
  try {
    let client = await mongodClient.connect(url);
    let db = client.db("zen");
    const decryptedString = cryptr.decrypt(req.params.email);
    let r = Math.random().toString(36).substring(7);
    let pass = r
    let salt = await bcrypt.genSalt(10)
    let hash = await bcrypt.hash(r, salt)
    pass = hash

    let result = await db.collection("users").findOneAndUpdate(
        { email: decryptedString },
        {
          $set: { password: pass }
        })
    let ssendMail = {
      from: 'sndmail26@gmail.com',
      to: decryptedString,
      subject: 'new password',
      text: `Your New Password: ${r}`
    };
    transporter.sendMail(ssendMail, function (error, info) {
      if (error) {
        console.log(error);
      } 
      else {
        res.json({
          message: "Email Sent"
        })
      }
    });

    client.close();

    res.json(result);
  }
  catch (err) {
    res.json("something went wrong");
    console.log(err);
  }
})



module.exports = router;
