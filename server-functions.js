const jwt = require("jsonwebtoken");

function createJwtToken(userData) {
  let newToken = jwt.sign(userData, process.env.JWT_SECRET);

    return newToken;
};

function verifyJwtToken(token) {
  let userId = jwt.verify(token, process.env.JWT_SECRET);
  
  return { _id: userId._id };
}

function extractJwtFromCookie(cookie) {
  let token;

  if (cookie) {
    token = cookie.slice(4);
    
    return token;
  }
};

module.exports = { createJwtToken, verifyJwtToken, extractJwtFromCookie };