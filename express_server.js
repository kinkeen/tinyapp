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
  //"b2xVn2": "http://www.lighthouselabs.ca",
  //"9sm5xK": "http://www.google.com"

  // b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  // i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }

};

//.....app routes..........
app.get('/', (req, res) => {
  const cookey = req.cookies['user_id']
  if (checkCookie(cookey, users)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login')
  }
});

app.get("/urls.json", (req, res) => {
  //res.json(urlDatabase )
  res.json(users)
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  }
  res.render("urls_index", templateVars);
});


app.get('/urls/new', (req,res)=>{
  const cookey = req.cookies['user_id']
  if (!checkCookie(cookey, users)) {
      res.redirect('/login')
  } else { 
    const templateVars = {
      user: users[req.cookies['user_id']],
    };
    res.render('urls_new', templateVars)
    console.log("gggggggggggggggg")
    res.redirect('/urls')
  }
  
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
  if (urlDatabase[req.params.shortURL]) {
    const templatedVars = {
      user: users[req.cookies['user_id']],
      shortURL: req.params.shortURL, 
      urlUserID: urlDatabase[req.params.shortURL].userID,
      longURL: urlDatabase[req.params.shortURL].longURL
    }
    res.render('urls_show', templatedVars)
  } else {
    res.status(404).send("The short URL you entered does not correspond with a long URL at this time.");
  }
})

app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL 
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL)
    }
  } 
}) 

app.post("/urls", (req, res) => {
  if (req.cookies['user_id']) {
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies['user_id'] 
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You must be logged in to a valid account to create short URLs.");
  } 
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.cookies['user_id'];
  const useUrl = urlsForUser(userID, urlDatabase);
  if (Object.keys(useUrl).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to delete this short URL.");
  }
})

app.post("/urls/:id", (req, res) => {
  const userID = req.cookies['user_id'];
  const useUrl = urlsForUser(userID, urlDatabase);
  if (Object.keys(useUrl).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls')
  } else {
    res.status(401).send("You do not have authorization to edit this short URL.");
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
    if (users[id].email === email) {
      return true
    }
  }
  return false;
};

const checkCookie = function(cookie, users) {
  for (const user in users) {
    if (cookie === users[user].id) {
      return true;
    }
  }
  return false;
}
const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if ( id === urlDatabase[shortURL]['userID']) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls
} 