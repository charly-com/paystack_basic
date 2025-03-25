const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String },
  status: { type: String, enum: ['draft', 'publish'], default: 'publish' },
  category: { type: String, default: '' },
  tags: [{ type: String }], 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: String }],
  comments: [{
    user: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Blog', blogSchema);