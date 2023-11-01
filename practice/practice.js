// modules
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;
require('dotenv').config();

// Connect to the database
const uri = process.env.dbUrl;

// request and response
app.get('/', async (req, res) => {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db('FMP');
    const Instructor_collection = database.collection('Instructor');
    const Office_collection = database.collection('Office');

    const data = await Instructor_collection.aggregate([
      {
        $lookup: {
          from: 'Office', // The name of the second collection
          localField: 'instructor_id', // The field from the 'Instructor' collection (assuming you have an 'office_id' field)
          foreignField: 'instructor_id', // The field from the 'Office' collection
          as: 'officeDetails' // The alias for the joined data
        }
      },
      {
        $project: {
          _id: 0,
          first_name: 1,
          last_name: 1,
          phone_number: 1,
          email: 1,
          school: 1,
          school_code: 1,
          department: 1,
          calendly_url: 1,
          ratemyprofessor_url: 1,
          image_url: 1,
          'officeDetails.office_building': 1, // Include only the 'room_number' field from the 'Office' collection
          'officeDetails.office_room': 1
        }
      }
    ]).toArray();

    // Restructure the data to ensure "First_name" appears at the beginning of each row
    const restructuredData = data.map(item => {
      return {
        First_name: item.first_name,
        Last_name: item.last_name,
        Phone_number: item.phone_number,
        Email: item.email,
        School: item.school,
        School_code: item.school_code,
        Department: item.department,
        Calendly_url: item.calendly_url,
        Ratemyprofessor_url: item.ratemyprofessor_url,
        Image_url: item.image_url,
        Office_building: item['officeDetails.office_building'],
        Office_room: item['officeDetails.office_room']
      };
    });

    res.type('application/json').send(restructuredData);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// open server on localhost
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
