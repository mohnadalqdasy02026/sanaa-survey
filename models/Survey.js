const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
    id: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: String,
    
    // User Identity Info
    fullName: String,
    phoneNumber: String,
    googleEmail: String,
    
    // Section 1: Sociodemographic
    gender: String,
    age: Number,
    weight: Number,
    height: Number,
    studyHours: Number,
    handDominance: String,
    smoking: String,
    exercise: String,
    chronicDiseases: String,

    // Section 2: Smartphone Usage
    phoneType: String,
    phoneSize: String,
    phoneUsageHours: Number,
    holdingMethod: String,
    neckPosture: String,
    usagePurpose: String, // سيتم حفظه كسلسلة نصية مفصولة بفواصل من الـ frontend

    // Section 3: Neck Pain
    neckPain: String,
    painDuration: String,
    painSeverity: Number,
    sleepImpact: String,
    numbness: String,
    painLocation: String // سيتم حفظه كسلسلة نصية مفصولة بفواصل من الـ frontend
}, { strict: false, timestamps: true });

module.exports = mongoose.model("Survey", surveySchema);
