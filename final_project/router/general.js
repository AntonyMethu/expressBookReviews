const express = require('express');
const axios = require('axios');
const { isValid, users } = require("./auth_users.js");
let books = require("./booksdb.js");

const public_users = express.Router();
const BASE_URL = "http://localhost:5000";

public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) { return res.status(200).json(book); }
  return res.status(404).json({ message: "Book not found for ISBN: " + isbn });
});

public_users.get('/author/:author', function (req, res) {
  const authorParam = req.params.author.toLowerCase();
  const matchedBooks = [];
  Object.keys(books).forEach((key) => {
    if (books[key].author.toLowerCase() === authorParam) { matchedBooks.push(books[key]); }
  });
  if (matchedBooks.length > 0) { return res.status(200).json({ booksByAuthor: matchedBooks }); }
  return res.status(404).json({ message: "No books found for author: " + req.params.author });
});

public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title.toLowerCase();
  const matchedBooks = [];
  Object.keys(books).forEach((key) => {
    if (books[key].title.toLowerCase() === titleParam) { matchedBooks.push(books[key]); }
  });
  if (matchedBooks.length > 0) { return res.status(200).json({ booksByTitle: matchedBooks }); }
  return res.status(404).json({ message: "No books found for title: " + req.params.title });
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    if (Object.keys(book.reviews).length === 0) {
      return res.status(200).json({ message: "No reviews found for this book." });
    }
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book not found for ISBN: " + isbn });
});

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists. Please choose a different username." });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

/* Task 10: Get all books using async/await with Axios */
const getAllBooks = async () => {
  const response = await axios.get(BASE_URL + "/");
  return response.data;
};

/* Task 11: Get book details based on ISBN using Promise callbacks */
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    axios.get(BASE_URL + "/isbn/" + isbn)
      .then((response) => { resolve(response.data); })
      .catch((error) => { reject(error); });
  });
};

/* Task 12: Get book details based on Author using async/await with Axios */
const getBooksByAuthor = async (author) => {
  const response = await axios.get(BASE_URL + "/author/" + encodeURIComponent(author));
  return response.data;
};

/* Task 13: Get book details based on Title using async/await with Axios */
const getBooksByTitle = async (title) => {
  const response = await axios.get(BASE_URL + "/title/" + encodeURIComponent(title));
  return response.data;
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
