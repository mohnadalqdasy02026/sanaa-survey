const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://mohnadalqdasy:mohnadalqdasy783737425@mohnad.rmrs2qa.mongodb.net/surveyDB";

mongoose.connect(mongoURI)
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.log("❌ Error:", err));

module.exports = mongoose;
