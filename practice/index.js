// modules
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;


// Connect to the database
const uri = process.env.MONG_DB_URL;

// request and response
app.get('/Search', async (req, res) => {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db('FMP');
    const collection = database.collection('Instructor');

    // Get the professor name from the query parameter
    const professorName = req.query.name;

    if (!professorName) {
      res.status(400).json({ error: 'Please provide a professor name in the query parameter "name"' });
    } else {
      // Search for professors by name
      const query = {
        $or: [
          { First_name: { $regex: professorName, $options: 'i' } }, // Case-insensitive search
          { Last_name: { $regex: professorName, $options: 'i' } },
        ],
      };

      const projection = { _id: 0, First_name: 1, Last_name: 1, Email: 1, Image:1 };
      const data = await collection.find(query, { projection }).toArray();
      const valuesOnly = data.map(item => Object.values(item).join(', ')).join('\n');


      if (data.length === 0) {
        res.status(404).json({ error: 'Professor not found' });
      } else {
        res.type('text').send(valuesOnly);
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

// Open the server on localhost
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

