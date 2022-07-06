const express = require("express");

const app = express();

app.get("/", (req, res) => res.send("hello world 2"));
app.listen(3100, () => console.log("Server ready"));
