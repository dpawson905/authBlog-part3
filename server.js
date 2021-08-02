/* 
  Please update debug to reflect the settings from package.json
  This time, instead of it having the * after the app name...
  we will call it server because this is the server file
*/
const debug = require('debug')('authblog-new:server');
const mongoose = require("mongoose");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  // debug(process.env)
}
const app = require("./app");

const DB = process.env.DB_URL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => debug("DB connection successful!"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  debug(`App running on port ${port}...`);
});
