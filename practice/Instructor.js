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
    const database = client.db('FMP'); // 여기에 데이터베이스 이름을 넣으세요`
    const collection = database.collection('Instructor'); // 여기에 컬렉션 이름을 넣으세요

    const data = await collection.find({}, { projection: { _id: 0, first_name: 1, last_name: 1, phone_number: 1, email: 1, school:1, schoo_code:1, department:1, calendly_url:1, ratemyprofessor_url:1, image_url:1 } }).toArray();
   
    res.type('text').send(data);
  } catch (error) {
    res.status(500).json({ error: '내부 서버 오류' });
  } finally {
    await client.close();
  }
});

// open server on localhost
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});