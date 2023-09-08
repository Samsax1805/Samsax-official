const express = require('express');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
app.use(express.static('public'));
app.use(express.static(__dirname))
app.use(bodyparser.urlencoded({extended:true}));

app.set('view engine','ejs');

// Database setup for MongoDB
const uri = process.env.URI;
const dbName = process.env.dbName;
const collectionName = process.env.collectionName;

const client = new MongoClient(uri,{
    serverApi:{
        version:ServerApiVersion.v1,
        strict:true,
        deprecationErrors:true,
    },
});

// Database Definition and Manipulation Functions
async function connect(){
    await client.connect().then(()=>{
        console.log('connceted to Mongodb ........')
    })
}

async function close(){
    await client.close().then(()=>{
        console.log('connection closed ..........')
    })
}

async function insertData(dbName, collectionName, data){
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(data);

    return result;
}

app.get('/',(req,res)=>{
    res.render('indexx');
})

app.post('/', async (req,res)=>{
    const clientDetails = {username,password} = req.body;

    try{
        await connect();
        await insertData(dbName,collectionName,clientDetails).then(()=>{
            console.log('Successfully submitted .........')
        })
    } finally {
        await close();
        res.redirect('/');
    }
})

app.listen(4000,()=>{
    console.log('server is running ........');
})