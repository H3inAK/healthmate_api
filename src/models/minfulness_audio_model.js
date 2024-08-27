const mongoose = require("mongoose");

const mindfulnessAudioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  playlist: {
    type: [String], 
    required: true,
  },
  audioType: {
    type: String,
    enum: ["Youtube", "Normal"], 
    required: true,
  },
  musicSource: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MindfulnessAudio = mongoose.model("MindfulnessAudio", mindfulnessAudioSchema);

module.exports = MindfulnessAudio;
