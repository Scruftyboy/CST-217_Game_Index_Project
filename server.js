 import express from "express";  

const app = express(); 

 import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const PORT = process.env.PORT || 3000;

import fs from 'fs';

let games = null;

try {
  const rawData = fs.readFileSync('./data/gamedata.json', 'utf8');
  games = JSON.parse(rawData);
 
} catch (error) {
  console.error("Error loading JSON file:", error);
}

app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// Beginning of Routes

app.get("/", (req, res) => {
  res.render("home", { pageTitle: "Welcome to my video game completion list", siteTitle: 'Game Index Project', activePage: "home" });
});

app.get("/completed", (req, res) => {
  res.render("completed", { pageTitle: "Completed", siteTitle: 'Game Index Project', activePage: "log", games_const: games });
});

app.get("/inprogress", (req, res) => {
  res.render("inprogress", { pageTitle: "In Progress", siteTitle: 'Game Index Project', activePage: "add", games_const: games });
});

app.get("/backlog", (req, res) => {
  res.render("backlog", { pageTitle: "Backlog", siteTitle: 'Game Index Project', activePage: "add", games_const: games });
});

app.get("/about", (req, res) => {
  res.render("about", { pageTitle: "About", siteTitle: 'Game Index Project', activePage: "add" });
});

// End of Routes

// Beginning of posting data

app.post("/change-status", (req, res) => {
  const postData = req.body;
  console.log(postData);
  let foundObject = null;
  foundObject = games.find(item => item["title"] === postData.title);

  foundObject.status = "completed"

  fs.writeFileSync("./data/gamedata.json", JSON.stringify(games, null, 2));
 
  res.render("change-status", { pageTitle: "Changed Status", siteTitle: 'Game Index Project', activePage: "add", games_const: games, title: postData.title });
});

app.post("/set-to-inprogress", (req, res) => {
  const postData = req.body;
  console.log(postData);
  let foundObject = null;
  foundObject = games.find(item => item["title"] === postData.title);

  foundObject.status = "inprogress"

  fs.writeFileSync("./data/gamedata.json", JSON.stringify(games, null, 2));
 
  res.render("change-status", { pageTitle: "Changed Status", siteTitle: 'Game Index Project', activePage: "add", games_const: games, title: postData.title });
});

app.post("/added-game", (req, res) => {
  const postData = req.body;
  console.log(postData);

  const newGame = {
    title: postData.title,
    cover: postData.cover,
    status: "backlog"
  };

  games.push(newGame);

  games.sort((a, b) => {
  const nameA = a.title.toUpperCase(); // Ignore case for sorting
  const nameB = b.title.toUpperCase(); // Ignore case for sorting

  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
  });

  fs.writeFileSync("./data/gamedata.json", JSON.stringify(games, null, 2));
 
  res.render("added-game", { pageTitle: "Added Game", siteTitle: 'Game Index Project', activePage: "add", games_const: games, title: postData.title });
});

// End of posting data

// Beginning of Error Block

app.get("/trigger-500", (req, res, next) => {
  next(new Error("Intentional test error"));
});

app.use((req, res) => {
  res.status(404).render("404", {
    pageTitle: "Not Found",
    url: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";
  const status = err.status || 500;

  // Minimal logging
  console.error(`[ERROR] ${status} ${req.method} ${req.url}`, err.message);

  res.status(status).render("500", {
    pageTitle: "Server Error",
    message: isProd ? "Head back to home?" : (err.message || "Error"),
    stack: isProd ? null : err.stack
  });
});

// End of Error Block


app.listen(PORT, () => {  
  console.log(`Server running at http://localhost:${PORT}`);  
});
