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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase )
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
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

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] 
  res.redirect(longURL)
  
})

app.post("/urls", (req, res) => {
  console.log(req.body);  
  res.send("Ok");         
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls')
})

app.post("/urls/:id", (req, res) => {
  const templatedVars = {shortURL: req.params.id, longURL: urlDatabase[req.params.id] }
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
