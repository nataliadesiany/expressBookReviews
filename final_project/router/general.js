const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function getAllBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

function getByISBN(isbn) {
  return new Promise((resolve, reject) => {
    let book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });
}

function getByAuthor(author) {
  return new Promise((resolve, reject) => {
    let keys = Object.keys(books);
    let filtered_books = [];
    
    keys.forEach((key) => {
      if(books[key].author === author) {
        filtered_books.push(books[key]);
      }
    });
    
    if (filtered_books.length > 0) {
      resolve(filtered_books);
    } else {
      reject("No books found by this author");
    }
  });
}

function getByTitle(title) {
  return new Promise((resolve, reject) => {
    let keys = Object.keys(books);
    let filtered_books = [];
    
    keys.forEach((key) => {
      if(books[key].title === title) {
        filtered_books.push(books[key]);
      }
    });
    
    if (filtered_books.length > 0) {
      resolve(filtered_books);
    } else {
      reject("No books found with this title");
    }
  });
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]);
 });

public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let filtered_books = [];
  
  let keys = Object.keys(books);
  
  keys.forEach((key) => {
    if(books[key].author === author) {
      filtered_books.push(books[key]);
    }
  });
  
  res.send(JSON.stringify(filtered_books, null, 4));
});

public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let filtered_books = [];
  
  let keys = Object.keys(books);
  
  keys.forEach((key) => {
    if(books[key].title === title) {
      filtered_books.push(books[key]);
    }
  });
  
  res.send(JSON.stringify(filtered_books, null, 4));
});

public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

public_users.get('/async', async function (req, res) {
  try {
    const allBooks = await getAllBooks();
    res.send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    res.status(500).json({message: error});
  }
});

public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await getByISBN(isbn);
    res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    res.status(404).json({message: error});
  }
});

public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const books = await getByAuthor(author);
    res.send(JSON.stringify(books, null, 4));
  } catch (error) {
    res.status(404).json({message: error});
  }
});

public_users.get('/async/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const books = await getByTitle(title);
    res.send(JSON.stringify(books, null, 4));
  } catch (error) {
    res.status(404).json({message: error});
  }
});

module.exports.general = public_users;
