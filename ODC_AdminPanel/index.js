const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { checkRedundantActivationCodes, checkTimeOutedExamCodes } = require('./utilities')
const adminsLogin = require('./routes/login');
const adminsFunctions = require('./routes/adminJobs');

const db = require('./connection');
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/login', adminsLogin);

app.use('/admin', adminsFunctions);

app.use('/', (req, res) => {
    res.send('Welcome to ODC Admin Panel');
});

setInterval(() => {
    checkTimeOutedExamCodes();
    checkRedundantActivationCodes();
}, 1000*60*60*24);

const PORT = process.env.PORT || 5000;
db.then(() => {
    console.log(`Admin Panel Server Connected to Database Successfully...`);
    app.listen(PORT, () => {
        console.log(`Admin Panel Server Running on Port ${PORT}...`);
    });
});