const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  photoUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;