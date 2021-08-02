/* 
  Please update debug to reflect the settings from package.json
  This time, instead of it having the * after the app name...
  we will call it app because this is the app file
*/
const debug = require('debug')('authblog-new:app');
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const sassMiddleware = require("node-sass-middleware");
const mongoSanitize = require("express-mongo-sanitize");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongo");

const User = require("./models/userModel");

const indexRouter = require("./routes/indexRouter");
const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/users");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Development logging
if (process.env.NODE_ENV.trim() === "development") {
  app.use(logger("common"));
}

// Set up parsers and node-sass
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(
  sassMiddleware({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));

// Set up session and session store
const sessionSettings = {
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60,
    maxAge: 1000 * 60 * 60,
  },
  store: MongoDBStore.create({
    mongoUrl: process.env.DB_URL,
    touchAfter: 24 * 3600,
    crypto: {
      secret: "bearer" + process.env.COOKIE_SECRET,
    },
  }),
  resave: true,
  saveUninitialized: false,
};

if (app.get("env") === "production") {
  app.set("trust proxy", true); // trust first proxy
  sessionSettings.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionSettings));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // res.locals.success = req.flash("success");
  // res.locals.error = req.flash("error");
  res.locals.title = "Auth Starter";
  res.locals.token = req.query.token;
  res.locals.currentUser = req.user;
  res.locals.isAuthenticated = req.user ? true : false;
  next();
});

app.locals.url = "home";

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;