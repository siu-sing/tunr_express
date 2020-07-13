console.log("starting up!!");

const express = require('express');
const methodOverride = require('method-override');
const pg = require('pg');

// Initialise postgres client
const configs = {
    user: 'siusing',
    host: '127.0.0.1',
    database: 'tunr_db',
    port: 5432,
};

const pool = new pg.Pool(configs);

pool.on('error', function (err) {
    console.log('idle client error', err.message, err.stack);
});

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();


app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(methodOverride('_method'));


// Set react-views to be the default view engine
const reactEngine = require('express-react-views').createEngine();
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', reactEngine);

/**
 * ===================================
 * Routes
 * ===================================
 */

const makeQuery = async function (query, values) {
    try {
        console.log("entered make query");
        let results = await pool.query(query, values);
        return results.rows;
    } catch (err) {
        return err;
    }
};

app.get('/', (request, response) => {
    // query database for all pokemon
    // let res = await makeQuery("select * from users;")
    // console.log(res);
    // respond with HTML page displaying all pokemon
    response.render('home');
});

app.get('/new', async (request, response) => {
    // respond with HTML page with form to create new pokemon
    
    console.log("query starting");
    let res = await makeQuery("select * from users");
    console.log(res);
    console.log("query ended");
    response.render('new');
});


/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
const server = app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));

let onClose = function () {

    console.log("closing");

    server.close(() => {

        console.log('Process terminated');

        pool.end(() => console.log('Shut down db connection pool'));
    })
};

process.on('SIGTERM', onClose);
process.on('SIGINT', onClose);