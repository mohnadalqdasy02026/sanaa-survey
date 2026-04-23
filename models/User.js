const mongoose = require("../db");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    hasSubmitted: { type: Boolean, default: false } // لمنع تكرار تعبئة الاستبيان
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
