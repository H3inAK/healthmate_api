const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Low'
    }
}, { timestamps: true });

module.exports = mongoose.model("Habit", habitSchema);
