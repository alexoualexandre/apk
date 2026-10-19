const mysql = require("mysql2/promise");

const connection = mysql.createPool({
  host: "localhost",
  user: "alexandre",
  password: "Rkyl32623!",
  database: "apk",
});

// eslint-disable-next-line no-undef
module.exports = { connection }
