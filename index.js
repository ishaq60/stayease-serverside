const express=require('express')
const cors=require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vu8ej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const port  =process.env.PORT || 7001

const app=express()

const corsOption = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,  // Corrected the typo from 'Credential' to 'credentials'
    optionsSuccessStatus: 200,
  };

app.use(cors(corsOption))
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Hello from stayease')
})


//Collectiom




// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);

const roomCollection=client.db("stayEase").collection("rooms")

//Get all jobs data

app.get('/rooms',async(req,res)=>{
    const result=await roomCollection.find().toArray()
    res.send(result)

})



//Get single Job data

app.get('/room/:id',async(req,res)=>{
  const id=req.params.id
  const query={_id:new ObjectId(id)}
  const result=await roomCollection.findOne(query)
  res.send(result)

})

app.get('/room-count',async(req,res)=>{
  const count=await roomCollection.countDocuments()
  res.send({count})

})

//Get all data for pagination
app.get('/all-rooms', async (req, res) => {
  const pages = parseInt(req.query.pages)-1 
  const size = parseInt(req.query.size)
  const search=req.params.search
  
  const sort=req.query.sort
  console.log(sort);

  console.log(pages, size);
  let query={
    roomName:{$regex:search,$options:"i"}

  };
const options={}
if(sort) {
  options.sort={pricePerNight: sort === 'asc' ? 1 : -1 }
}
  const result = await roomCollection.find(query,options).
  skip(pages * size).limit(size)
  .toArray();

  res.send(result);
});





app.listen(port,()=>console.log(`server running on ${port}`))