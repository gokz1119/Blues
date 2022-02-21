const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zephyr1119',
    database: 'nodelogin',
    port: 3307
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function (request, response) {
    // Render login template
    response.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/auth
app.post('/home', function (request, response) {
    console.log(request.body)
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            console.log(results);
            if (results.length > 0) {
                // Authenticate the user
                request.session.loggedin = true;
                request.session.username = username;
                // Redirect to home page
                return response.redirect('/home');
            } else {
                // response.send('Incorrect Username and/or Password!');
                return response.sendFile('D:\\S5\\DBMS_Lab\\Miniproject\\nodelogin\\failure.html');

            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

// http://localhost:3000/home
app.get('/home', function (request, response) {
    // If the user is loggedin
    if (request.session.loggedin) {
        // Output username

        return response.sendFile('D:\\S5\\DBMS_Lab\\Miniproject\\nodelogin\\success.html')
        // response.sendFile(path.join(__dirname + '\\success.html'));
        // window.location.href = "file:///D:/S5/DBMS_Lab/Miniproject/nodelogin/success.html";
        // response.send('Welcome back, ' + request.session.username + '!');
    } else {
        // Not logged in

        return response.sendFile('D:\\S5\\DBMS_Lab\\Miniproject\\nodelogin\\failure.html');
        // response.send('Please login to view this page!');
    }
    response.end();
});

app.listen(3000);