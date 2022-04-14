const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const db = require('./connection');
const studentAuth = require('./routes/auth');
const studentFunctions = require('./routes/functionalities');

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());


app.use('/auth', studentAuth);
app.use('/student', studentFunctions);

app.use('/', (req, res) => {
    res.send('Welcome to ODC Student Panel');
});


const PORT = process.env.PORT || 3000;
db.then(() => {
    console.log(`Student Panel Server Connected to Database Successfully...`);
    app.listen(PORT, () => {
        console.log(`Student Panel Server Running on Port ${PORT}...`);
    });
});