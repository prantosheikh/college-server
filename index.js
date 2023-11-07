require("dotenv").config();
const express = require("express");

const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.efhcwjr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollections = client.db("CollegeBookingDB").collection("users");
    
    const collegeCollections = client
      .db("CollegeBookingDB")
      .collection("college");
    const collegesCollections = client
      .db("CollegeBookingDB")
      .collection("Colleges");
    const collegeSectionCollections = client
      .db("CollegeBookingDB")
      .collection("collegeSection");
    const collegeImageCollections = client
      .db("CollegeBookingDB")
      .collection("imageGallery");

    await collegeCollections.createIndex({ collegeName: "text" });
    await collegeCollections.createIndex({ keys: 1 });

    // await collegeCollections.createIndex({ keys: 1});

    // college single users save
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollections.findOne(query);

      if (existingUser) {
        return res.send({ message: " user already exists" });
      }
      const result = await usersCollections.insertOne(user);
      res.send(result);
    });

    app.get("/search", async (req, res) => {
      try {
        const { query } = req.query;
        const collegeCollections = client
          .db("CollegeBookingDB")
          .collection("college");

        // Perform the text search on the 'college' collection using the 'query' parameter
        // Perform the text search on the 'college' collection using the 'query' parameter
        const colleges = await collegeCollections
          .find({ $text: { $search: query } })
          .toArray();
        res.json(colleges);
      } catch (error) {
        console.error("Error searching colleges:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
 
    // Home Colleages 
    app.get("/collegeSection", async (req, res) => {
      const result = await collegeSectionCollections.find().toArray();
      res.send(result);
    });
    // Home Colleages 
    app.get("/colleges", async (req, res) => {
      const result = await collegesCollections.find().toArray();
      res.send(result);
    });

    // gallery photo
    app.get("/collegeImageGallery", async (req, res) => {
      const result = await collegeImageCollections.find().toArray();
      res.send(result);
    });


    app.get("/review", async (req, res) => {
      // const options = {
      //   // Include only the `title` and `imdb` fields in each returned document
      //   projection: {  reviews: 1, college_name: 1  },
      // };
      const result = await collegeSectionCollections.find().toArray();
      res.send(result);
    });

    app.get("/college-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegeSectionCollections.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("College Booking is Running");
});

app.listen(port, () => {
  console.log(`College app listening on port ${port}`);
});
