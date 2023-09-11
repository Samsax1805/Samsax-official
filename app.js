const express = require('express');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
require ('./passport');
const { MongoClient, ServerApiVersion } = require('mongodb');
const session = require('express-session');
const passport = require('passport');


const app = express();
app.use(express.static('public'));
app.use(express.static(__dirname));
app.use(bodyparser.urlencoded({extended:true}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(passport.initialize())
app.use(passport.session());

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

//middleware function for authentication
function isLoggedIn(req,res,next) {
    if (req.user) {
        next();
    } else{
        res.sendStatus(404);
    }
}

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

async function users(dbName, collectionName, filter) {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const documents = await collection.find(filter).toArray();
  return documents;
}

app.get('/register',(req,res)=>{
    res.render('page2');
})

app.post('/register',async (req,res)=>{
    // const gender = req.body.gender;
    const userData = {fname,lname,gender,phone,email,password} = req.body;
    console.log(userData);
    var foundUser = false;

    try{
        await connect();

        const findUser = await users(dbName,collectionName,{});
        findUser.forEach(user =>{
            if(user.email === userData.email){
                foundUser = true;
                console.log('found user')
            }
        });

        if (!foundUser) {
            await insertData(dbName,collectionName,userData);
            res.redirect('/login');
            console.log('new user added successfully ..........')
        }
    } finally{
        await close();
    }
})

app.get('/login',(req,res)=>{
    res.render('indexx');
})

app.post('/login', async (req,res)=>{
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

//User authentication

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));

app.get('/auth/google/success',isLoggedIn, async (req,res)=>{
    let currentUser = {name,displayName,email} = req.user;
    var foundUser = false;

    try{
        await connect();

        const findUser = await users(dbName,collectionName,{});
        findUser.forEach(user =>{
            if(user.email === currentUser.email){
                foundUser = true;
                console.log('found user')
            }
        });

        if (!foundUser) {
            await insertData(dbName,collectionName,currentUser);
            console.log('new user added successfully ..........')
        }
    } finally{
        res.send(`welcome ${currentUser.displayName}`)
        await close();
    }
    
           
    })
    

app.get('/auth/google/failure',(req,res)=>{
    res.send('its not working')
})

app.listen(4000,()=>{
    console.log('server is running ........');
})