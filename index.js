const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId

const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.clvrh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentsCollection = client.db("patientsCare").collection("appointments");
  const doctorsCollection = client.db("patientsCare").collection("doctors");
  console.log('connected')

  app.post('/addAppointment', (req, res) => {
    const newAppointment = req.body;
    appointmentsCollection.insertOne(newAppointment)
      .then(result => {
        res.redirect('/');
        console.log(result.insertedId)
      });
  });

  app.get('/appointments', (req, res) => {
    console.log(req.query.email)
    appointmentsCollection.find()
      .toArray((err, appointment) => {
        res.send(appointment)
      });
  });

  app.post('/appointmentsByDate', (req, res) => {
    const date = req.body.date;
    appointmentsCollection.find({ appointmentDate: date })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.post('/addDoctor', (req, res) => {
    const newDoctor = req.body;
    doctorsCollection.insertOne(newDoctor)
      .then(result => {
        res.redirect('/');
        console.log(result.insertedId)
      });
  });

  app.get('/doctors', (req, res) => {
    doctorsCollection.find()
      .toArray((err, doctors) => {
        res.send(doctors)
      });
  });

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    doctorsCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0)
      })
  });

  app.patch('/updateStatus/:id', (req, res) => {
    const Status = req.body.status;
    appointmentsCollection.updateOne({ _id: ObjectId(req.params.id) },
      {
        $set: { appointmentStatus: Status }
      })
      .then(result => {
        res.send(result)
      });
  });

  app.delete('/deleteAppointment/:id', (req, res) => {
    appointmentsCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        res.send(result)
      });
  });

  app.post('/todaysAppointment', (req, res) => {
    const date = req.body.date;
    appointmentsCollection.find({ todaysDate: date })
      .toArray((err, documents) => {
        res.send(documents)
      });
  });

  app.post('/pendingAppointment', (req, res) => {
    const status = req.body.status;
    appointmentsCollection.find({ appointmentStatus: status })
      .toArray((err, documents) => {
        res.send(documents)
      });
  });

  app.patch('/prescription/:id', (req, res) => {
    const prescription = req.body.prescription;
    console.log(prescription)
    appointmentsCollection.updateOne({ _id: ObjectId(req.params.id) },
      {
        $set: { prescription: prescription }
      })
      .then(result => {
        res.send(result)
      });
  });

  app.get('/yourPrescription', (req, res) => {
    console.log(req.query.email)
    appointmentsCollection.find({ email: req.query.email })
      .toArray((err, appointment) => {
        res.send(appointment)
      });
  });





});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})