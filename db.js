const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://mohnadalqdasy:mohnadalqdasy783737425@mohnad.rmrs2qa.mongodb.net/surveyDB")
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.log("❌ Error:", err));

module.exports = mongoose;