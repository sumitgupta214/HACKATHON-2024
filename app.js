const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const { spawn } = require("child_process");
const axios = require('axios');

app.set("view engine", "ejs");

//Selecting Views Directory For accessing different Pages.
app.set("views", path.join(__dirname, "Views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(express.json());

app.engine("ejs", ejsMate);

app.get("/", (req, res) => {
  let obj = {}; // Initialize as an object
  obj._locals = "none"; // Now this should work

  res.render("index.ejs", { obj });
});

app.post("/verify", async (req, res) => {

  try {
    const response = await axios.post(
      "http://localhost:5001/predict",
      req.body
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error calling Python service:", error);
    res.status(500).send("Error processing request");
  }

});

app.listen(3000, () => {
  console.log(`Port is listening on ${3000}`);
});
