const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.static('.'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');
db.serialize(function () {
  db.run('CREATE TABLE user (username TEXT, password TEXT, title TEXT)');
  db.run(
    "INSERT INTO user VALUES ('privilegedUser', 'privilegedUser1', 'Administrator')"
  );
});

// GET method route
app.get('/', function (req, res) {
  const filePath = path.join(__dirname, 'index.html');
  res.sendFile(filePath);
});

// POST method route for login form
app.post('/login', function (req, res) {
  const { username, password } = req.body;

  // Log the username, password, and SQL query string
  console.log('Username:', username);
  console.log('Password:', password);
  const query = `SELECT title FROM user WHERE username = '${username}' AND password = '${password}'`;
  console.log('SQL Query:', query);

  db.all(query, function (err, rows) {
    if (err) {
      console.error('Error executing query:', err.message);
      res.redirect('/index.html#error');
    } else {
      if (rows.length > 0) {
        const row = rows[0];
        res.send(
          'Hello <b>' +
            row.title +
            '!</b><br /> This file contains all your secret data: <br /><br /> SECRETS <br /><br /> MORE SECRETS <br /><br /> <a href="/index.html">Go back to login</a>'
        );
      } else {
        res.redirect('/index.html#unauthorized');
      }
    }
  });
});

const port = 3000;
http.createServer(app).listen(port, function () {
  console.log(`Server is listening on port ${port}`);
});
