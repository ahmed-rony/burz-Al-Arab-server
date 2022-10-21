const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const { initializeApp } = require('firebase-admin/app');


// =======================

var admin = require("firebase-admin");

var serviceAccount = require("./configs/burz-al-arab-c47aa-firebase-adminsdk-eqxa0-b742bd7329.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// =======================


const app = express();
// ====  middleware  ====
app.use(cors());
app.use(bodyParser.json());


// ==============================
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ow7smv1.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// ==============================

app.get('/', (req, res) =>{
    res.send('Hello bristy..')
})
// ==============================

client.connect(err => {
  const bookingCollection = client.db("truelancer").collection("trueDB");
  // perform actions on the collection object
  
  // =====================================
  app.post('/addBooking', (req, res) =>{
    const newBooking = req.body;
    bookingCollection.insertOne(newBooking)
    .then(result =>{
      res.send(result.insertedCount > 0)
    })
  })
  // =====================================
  app.get('/bookings', (req, res) =>{
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1];
      // console.log({idToken});
      admin.auth().verifyIdToken(idToken)  // admin.auth() ****
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;  // token theke verify kore email pacchi..pore ta if condition die match kore api data dicchi;
          
          const queryEmail = req.query.email;
          // console.log(tokenEmail,'==', queryEmail);
          // ===============
          if(tokenEmail == queryEmail){
            bookingCollection.find({email: queryEmail})  // query kore specific data filter kore newa jabe;
            .toArray((err, documents) =>{
              res.status(200).send(documents)
            })
          }
          else{
            res.status(401).send('unauthorised access');
          }
        })
        .catch((error) => {
          res.status(401).send('unauthorised access');
        })
    }
    else{
      res.status(401).send('unauthorised access');
    }


  })
  // =====================================
  
});


app.listen(30000);