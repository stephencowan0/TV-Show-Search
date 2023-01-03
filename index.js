const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');

// database configuration
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

// test your database
db.connect()
    .then(obj => {
        console.log('Database connection successful'); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.listen(3000);
console.log('Server is listening on port 3000');

app.get('/', (req, res) => {
    res.redirect('/anotherRoute'); //this will call the /anotherRoute route in the API
});

app.get('/anotherRoute', (req, res) => {
    res.redirect('/main')
});

app.get('/main', (req, res) => {
    var search = req.query.showName;
    if (search == undefined) {
        search = 'Doctor Who'
    }
    axios({
        url: `https://api.tvmaze.com/singlesearch/shows?q='${search}'`,
        method: 'GET',
        dataType: 'json'
    })
        .then(results => {
            res.render('pages/main', {
                results,
            })
        })
        .catch(error => {
            results = undefined;
            res.render('pages/main', {
                results,
                error: true,
                message: "Show Not Found",
            })
        });
});