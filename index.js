const path = require("node:path");
// const { Pool } = require("pg");
const { PrismaClient } = require('@prisma/client');
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");
const app = express();

const prisma = new PrismaClient();

require("dotenv").config();
// console.log(process.env)

// skipped: pool, links

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// needs to be below:  const app = express();
// to serve static assets:
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// tested
app.get("/", async (req, res) => {
  res.send('hello world');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Express app for TOP members only app - listening on port ${PORT}!`);
});