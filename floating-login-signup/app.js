const express = require('express')
const bodyparser = require('body-parser')
const ejs = require('ejs');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { Collection } = require('mongoose');
const dotenv = require('dotenv').config();


const app = express();

app.use(express.static('public'));
app.use(express.static(__dirname));
app.use(bodyparser.urlencoded({extends:false}));

app.set('view engine', 'ejs');

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

async function connect(){
    (await client.connect()).withSession(()=>{
        console.log('connected to mongoDB ..........');
    });
}

async function close() {
    await client.close().then(()=>{
        console.log(' oops closed');
    })
}

async function insertData(dbName,collectionName,data) {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(data);

    return result;
}

async function users(dbName,collectionName,filter){
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const documents = await collection.find(filter).toArray();

    return documents;
}


app.get('/signin',(req,res)=>{
    res.render('index')
})

app.post('/signin',async (req,res)=>{
    const userDetail = {email,password} = req.body;
    let foundUser = false;

    try{
        await connect();

        const user = await users(dbName,collectionName,{});

        user.forEach(findUser=>{
            if ((findUser.email === userDetail.email) && (findUser.password === userDetail.password)) {
                foundUser = true;
                res.send(`welcome back ${findUser.username}`);
                console.log('Found User: ',foundUser);
            } else {
                res.status(404);
                console.log('found user: ',foundUser);
                res.redirect('/signin');
            }
        })
    } finally{
        await close();
    }

    console.log('User: ',userDetail);
})

app.post('/signup',async (req,res)=>{
    const userDetail = {username,email,password} = req.body;
    const foundUser = false;

    try{
        await connect();

        const user = await users(dbName,collectionName,{});
        user.forEach(findUser=>{
            if (findUser.email === userDetail.email) {
                foundUser = true;
                console.log('user: ',foundUser);
            }
        });

        if (!foundUser) {
            await insertData(dbName,collectionName,userDetail);
            res.redirect('/signin');
            console.log('User added .......');
        } else {
            res.send('user already exist');
        }

    } finally{
        await close();
    }

    console.log('user: ',{username:userDetail})
})

app.listen(3000,()=>{
    console.log('server is up..........')
})