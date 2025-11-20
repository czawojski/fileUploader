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

// skipped pool

const links = [
  { href: "/", text: "Home" },
  { href: "/sign-up", text: "Sign Up" },
  { href: "/post", text: "Post" },
  { href: "/member", text: "Join the Club" },
];

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// needs to be below:  const app = express();
// to serve static assets:
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// testing 11-17-25
app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  // console.log(users);
  res.render("index", {user: req.user, users: users, links: links})
});

// testing 11-19-25
app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// testing 11-19-25
app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);

// testing 11-13-25
app.get("/sign-up", (req, res) => res.render("sign-up-form", {links: links}));

app.post("/sign-up", async (req, res, next) => {
 try {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = await prisma.user.create({
  data: {
    email: req.body.email,
    name: req.body.name,
    password: hashedPassword,
  },
})
  res.redirect("/");
 } catch (error) {
    console.error(error);
    next(error);
   }
});

// testing 11-19-25
passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      })      

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      
      const match = await bcrypt.compare(password, user.password);
      
      if (!match) {
      // passwords do not match!
      return done(null, false, { message: "Incorrect password" })
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },
    }) 
    done(null, user);
  } catch(err) {
    done(err);
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Express app for TOP members only app - listening on port ${PORT}!`);
});