const express = require("express");
const bodyParser = require('body-parser');
const cookies = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies())

//.......User Object..............

const users = {
  "userRandomID": {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//.....app routes..........
app.get('/', (req, res) => {
  res.send('Hello!')
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase )
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  }
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req,res)=>{
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render('urls_new', templateVars)
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = getID(email);
  console.log(user_id)
  if (!emailLookUp(email, users)) {
    res.statusCode = 403;
    res.send("User cannot be found")
  } else if (emailLookUp(email, users)) {
    if (users[user_id].password !== password) {
      res.statusCode = 403;
      res.send("Username or password does not match")
    } else {
      res.cookie('user_id', user_id) // create a cookie
      res.redirect('/urls')
    }
  } 
});

app.get('/login', (req, res) => {
  const templatedVars = { 
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  }
  res.render('url_login', templatedVars)
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
});

app.get('/register', (req, res) => {
  const templatedVars = { 
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  }
  res.render('urls_registration', templatedVars)
});

app.post('/register', (req, res) => {
  const user_id = generateRandomString(4);
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    res.statusCode = 400;
    res.send(`${res.statusCode} Bad Request response no input`)
  } else if (emailLookUp(userEmail, users)) {
    res.statusCode = 400;
    res.send(`${res.statusCode} User Email Exist`) 
   } else {
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: req.body.password
    }
     res.cookie('user_id', user_id);
     res.redirect('/urls');
  }
  console.log(emailLookUp(userEmail))
});

app.get("/urls/:shortURL", (req, res) => {
  const templatedVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] 
  }
  res.render('urls_show', templatedVars)
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] 
  res.redirect(longURL)
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  res.redirect(`/u/${shortURL}`)
  urlDatabase[shortURL] = req.body.longURL;
});
  
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls')
});

app.post("/urls/:id", (req, res) => {
  const user_id = res.cookie('user_id', req.body.user_id);
  const templatedVars = {
    user: req.cookies['user_id'],
    user: users[user_id],
    shortURL: req.params.id, longURL: urlDatabase[req.params.id] }
  res.render('urls_show', templatedVars)
  if (Object.keys(urlDatabase).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL] = req.body.newURL;
  } 
});
//-----listen----------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function(num) {
  const letter = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const number = '123456790'.split('')
  let holder = '';
  let newStr = '';

  for (let i = 0; i < num; i++){
    holder = Math.floor(Math.random() * 25);
    if (holder > 8) {
      newStr += letter[holder];
    } else {
      newStr += number[holder];
    }
  }
  return newStr;
};

const getID = function(email) {
  for (let item in users) {
    if (users[item].email === email) {
      return users[item]['id'];
    } 
  }
  return null;
};

const emailLookUp = function(email, users) {
  for(let id in users) {
    if (users[id]['email'] === email) {
      return true
    }
  }
  return false;
};