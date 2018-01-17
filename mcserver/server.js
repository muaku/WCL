const express = require("express")
const app = express()
const mongoose = require("mongoose")
const mqtt = require('mqtt')
const _ = require("lodash")
const Broker = require("./config").Broker
const MongoDB = require("./config").MongoDB
const mongodbURL = `mongodb://localhost/${MongoDB.dbName}`
mongoose.connect(mongodbURL, {useMongoClient: true})    /* Connect to mongodb */
const micro = require("./model").micro
const moment = require("moment-timezone")
moment.tz.setDefault("Asia/Tokyo")
// console.log("Time: ", moment().format())
/* Connect to mqtt broker */
const client  = mqtt.connect(`mqtts://${Broker.Server}:${Broker.SSL_Port}`,{username: Broker.User, password: Broker.Password})

client.on('connect', function(ck) {
  console.log('Connected to Broker')
});
client.on('error', function(err) {
  console.log('Connecte error: ', err)
});

client.subscribe('#');

client.on('message', function(topic, message) {
  console.log(topic, JSON.parse(message))
    /* TODO save message data to DB */
    if(!_.isEmpty(JSON.parse(message))) {
        var newmsg = JSON.parse(message)
        var data = {
          heart: newmsg.heart,
          breath: newmsg.breath,
          motion: newmsg.motion,
          created_at: moment().format()
        }
        var microData = new micro(data)
        microData.save()
    }
})

const PORT = 9000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})