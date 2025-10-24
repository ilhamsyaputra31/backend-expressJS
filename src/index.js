require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');
const cors = require('cors');

const router = require('./routes/router');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

app.use('/', router);

MongoClient.connect(process.env.DB_URL, (err, client) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    app.listen(process.env.SERVER_PORT, () => {console.log('Server Running')});
    
    const db = client.db(process.env.DB_NAME);
    
    client.close();
});
