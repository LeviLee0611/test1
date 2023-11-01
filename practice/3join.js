const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;
require('dotenv').config();

// Connect to the database
const uri = process.env.dbUrl;

app.get('/', async (req, res) => {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db('FMP');
    const Instructor_collection = database.collection('Instructor');
    const Office_collection = database.collection('Office');
    const Course_collection = database.collection('Course');

    const data = await Instructor_collection.aggregate([
      {
        $lookup: {
          from: 'Office', // The name of the second collection
          localField: 'instructor_id', // The field from the 'Instructor' collection
          foreignField: 'instructor_id', // The field from the 'Office' collection
          as: 'officeDetails', // The alias for the joined 'Office' data
        },
      },
      {
        $lookup: {
          from: 'Course',
          localField: 'instructor_id',
          foreignField: 'instructor_id',
          as: 'courseDetails',
        },
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
          'officeDetails.office_building': 1,
          'officeDetails.office_room': 1,
          'courseDetails.subject_name': 1,
          'courseDetails.subject_code': 1,
          'courseDetails.course_code': 1,
          'courseDetails.course_section': 1,
          'courseDetails.course_name': 1,
          'courseDetails.course_dayofweek': 1,
          'courseDetails.course_time': 1,
          'courseDetails.course_building': 1,
          'courseDetails.course_room': 1,
        },
      },
    ]).toArray();

    res.type('application/json').send(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
