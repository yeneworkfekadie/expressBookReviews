const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists" });
  }
  
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };
    const bookList = await getBooks();
    res.send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const getBookByISBN = (isbn) => {
      return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject("Book not found");
        }
      });
    };
    const book = await getBookByISBN(isbn);
    res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    res.status(404).json({ message: error });
  }
});
  
// Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const getBooksByAuthor = (author) => {
      return new Promise((resolve, reject) => {
        const booksByAuthor = [];
        const keys = Object.keys(books);
        for (let i = 0; i < keys.length; i++) {
          const bookId = keys[i];
          if (books[bookId].author === author) {
            booksByAuthor.push({
              id: bookId,
              ...books[bookId]
            });
          }
        }
        if (booksByAuthor.length > 0) {
          resolve(booksByAuthor);
        } else {
          reject("No books found by this author");
        }
      });
    };
    const booksByAuthor = await getBooksByAuthor(author);
    res.send(JSON.stringify(booksByAuthor, null, 4));
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const getBooksByTitle = (title) => {
      return new Promise((resolve, reject) => {
        const booksByTitle = [];
        const keys = Object.keys(books);
        for (let i = 0; i < keys.length; i++) {
          const bookId = keys[i];
          if (books[bookId].title === title) {
            booksByTitle.push({
              id: bookId,
              ...books[bookId]
            });
          }
        }
        if (booksByTitle.length > 0) {
          resolve(booksByTitle);
        } else {
          reject("No books found with this title");
        }
      });
    };
    const booksByTitle = await getBooksByTitle(title);
    res.send(JSON.stringify(booksByTitle, null, 4));
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.send(JSON.stringify(book.reviews, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
