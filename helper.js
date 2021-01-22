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

  const getUserByEmail = function(email, userDatabase) {
    for (let item in userDatabase) {
      if (userDatabase[item].email === email) {
        return userDatabase[item]['id'];
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

  const checksession = function(cookie, users) {
    for (const user in users) {
      if (cookie === users[user].id) {
        return true;
      }
    }
    return false;
  };

  const urlsForUser = function(id, urlDatabase) {
    const userUrls = {};
    for (const shortURL in urlDatabase) {
      if ( id === urlDatabase[shortURL]['userID']) {
        userUrls[shortURL] = urlDatabase[shortURL];
      }
    }
    return userUrls
  };
  
  module.exports = {
    generateRandomString,
    getUserByEmail,
    emailLookUp,
    checksession,
    urlsForUser
  }