const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

const verifyToken = (req) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try { return jwt.verify(token, "access"); } catch (err) { return null; }
  }
  if (req.session && req.session.authorization) {
    const token = req.session.authorization.accessToken;
    try { return jwt.verify(token, "access"); } catch (err) { return null; }
  }
  return null;
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "User successfully logged in.", token: accessToken });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ message: "User not logged in. Please login first." });
  }
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = decoded.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for ISBN: " + isbn });
  }
  if (!review) {
    return res.status(400).json({ message: "Review text is required as a query parameter ?review=..." });
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: "Review by '" + username + "' successfully added/modified for ISBN " + isbn + ".",
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ message: "User not logged in. Please login first." });
  }
  const isbn = req.params.isbn;
  const username = decoded.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for ISBN: " + isbn });
  }
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review by '" + username + "' found for ISBN " + isbn + "." });
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: "Review by '" + username + "' for ISBN " + isbn + " has been deleted.",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
