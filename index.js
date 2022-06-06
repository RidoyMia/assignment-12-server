const express = require('express')
const app = express()
var cors = require('cors')
require('dotenv').config()

const port =  process.env.PORT || 7000
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.PRIVATE_KEY}:${process.env.PRIVET_USER}@cluster0.c5u7y.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const Servicescollection = client.db('cycle').collection('Services');
        const Usercollection = client.db('cycle').collection('User');
        const bookingCollection = client.db('cycle').collection('booking');
        const adminCollection = client.db('cycle').collection('admin');
        app.get('/services',async(req,res)=>{
            const query = {};
            const cursor = Servicescollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        
        //
        
        app.get('/service/:id', async (req, res) => {
          const id = req.params.id;
        
          const query = { _id: ObjectId(id) };
          const service = await Servicescollection.findOne(query);
          res.send(service);
      });
      
  
      app.put('/User/:email',async(req,res)=>{
        const email = req.params.email;
        
        const user = req.body;
        console.log(user)
        const filter = {email : email}
        const options = { upsert: true };
        if(user.email){
          const updateDoc = {
            $set: {
              email : user?.email,
             
              
            },
          };
          const result = await Usercollection.updateOne(filter, updateDoc,options);
          res.send(result)
        }
        

      })





      app.put('/User/admin/:email',async(req,res)=>{
        const email = req.params.email;
        
        const user = req.body;
        const filter = {email : email}
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            email : user.email,
            name : user.name,
            role : user.role,
          },
        };
        const result = await Usercollection.updateOne(filter, updateDoc,options);
        res.send(result)

      })



      
     
      
      app.put('/order/:name',async(req,res)=>{
        const name = req.params.name;
        const booking = req.body;
        
        const filter = {name : name}
        const movie = await bookingCollection .findOne(filter);
        const options = { upsert: true };
      
        if(movie?.quantity){
         const  updateDoc = {
            $set: {
              userName : booking.userName,
              email : booking.email,
              name : booking.name,
              quantity : movie?.quantity + booking.quantity,
              per_price : booking.per_price,
              
            },
          };
          const result = await bookingCollection.updateOne(filter, updateDoc,options);
          res.send(result)

    
        }
        else{
         const updateDoc = {
            $set: {
              userName : booking.userName,
              email : booking.email,
              name : booking.name,
              quantity : booking.quantity,
              per_price : booking.per_price,
              
            },
          };
          const ami = await bookingCollection.updateOne(filter, updateDoc,options);
          res.send(ami)

        }
        
       
      })
      
      app.get('/order',async(req,res)=>{
        const query = {};
        const cursor =  bookingCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
      })
     
      app.get('/order/:email',async(req,res)=>{
        const email = req.params.email;
        const query = {email : email};
        const service = await bookingCollection.find(query);
        const curson = await service.toArray()

        res.send(curson)

      })
      //
      app.get('/users',async(req,res)=>{
        const query = {};
        const cursor =  Usercollection.find(query);
        const result = await cursor.toArray();
        res.send(result)

      })
      app.get('/available',async(req,res)=>{
        const query = {};
            const cursor = Servicescollection.find(query);
            const result = await cursor.toArray();

        const filter = {};
        const cursors =  bookingCollection.find(filter);
        const bokking = await cursors.toArray();
        result.forEach(single=>{
          const boked = bokking.filter(book => book.name === single.name);
          console.log(boked)
         const signlebook = boked.map(b => b.quantity)
        
         const avail = single.quantity - signlebook;
         single.quantity = avail;
         
        })
        res.send(result)
        

      })
      app.get('/available/:id',async(req,res)=>{
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const service = await Servicescollection.findOne(query);
          res.send(service);
      })
    }
    finally{

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World wide!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})