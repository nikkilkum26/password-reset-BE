let mongodb = require('mongodb')
let mongodClient = mongodb.MongoClient;
let url = "mongodb+srv://pswd123:wI8aD6bxgryMg0eg@zencluster.y8kfe.mongodb.net/?retryWrites=true&w=majority";
let JWT_SECRET= "e78h78fg43yuhfwq3hieh2i3";

module.exports = {url,mongodClient,JWT_SECRET}