const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req,res)=>{
  res.render('urls_new');
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body)
  res.send('received new url')
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] 
  res.redirect(longURL)
  
})

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  res.redirect(`/u/${shortURL}`)
  urlDatabase[shortURL] = req.body.longURL;
  console.log (urlDatabase);
})

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls')
})

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
