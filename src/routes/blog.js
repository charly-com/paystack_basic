const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Blog creation route with new fields
router.post('/', upload.single('image'), async (req, res) => {
  const { title, content, author, status, category, tags } = req.body;
  const imageUrl = req.file ? req.file.path : null;

  try {
    const parsedTags = tags ? JSON.parse(tags) : [];

    const blog = new Blog({
      title,
      content,
      author,
      imageUrl,
      status: status || 'publish', 
      category: category || '', 
      tags: parsedTags,
    });

    await blog.save();
    res.status(201).json({ message: 'Blog post created', blog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Failed to create blog post' });
  }
});

// Standalone image upload route (unchanged, but included for completeness)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const imageUrl = req.file.path; 
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Fetch all blogs (updated to include new fields in response)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query; 
    const filter = status ? { status } : {}; // Apply filter if status is provided
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// Fetch single blog by ID (updated to include new fields)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found' });
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});

// Update blog with new fields
router.put('/:id', upload.single('image'), async (req, res) => {
  const { title, content, author, status, category, tags } = req.body;
  const imageUrl = req.file ? req.file.path : undefined;

  try {
    const updateData = { title, content, author, updatedAt: Date.now() };
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (status) updateData.status = status; // Update status if provided
    if (category !== undefined) updateData.category = category; // Allow empty string
    if (tags) updateData.tags = JSON.parse(tags); // Parse tags if provided

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!blog) return res.status(404).json({ message: 'Blog post not found' });
    res.json({ message: 'Blog post updated', blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Failed to update blog post' });
  }
});

// Delete blog (unchanged)
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found' });
    if (blog.imageUrl) await cloudinary.uploader.destroy(blog.imageUrl.split('/').pop().split('.')[0]);
    res.json({ message: 'Blog post deleted' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
});

// Like blog (unchanged)
router.post('/:id/like', async (req, res) => {
  const { userId } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found' });

    const liked = blog.likes.includes(userId);
    if (liked) {
      blog.likes = blog.likes.filter(id => id !== userId);
    } else {
      blog.likes.push(userId);
    }
    await blog.save();
    res.json({ message: liked ? 'Blog unliked' : 'Blog liked', likes: blog.likes });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({ message: 'Failed to like blog post' });
  }
});

// Add comment (unchanged)
router.post('/:id/comments', async (req, res) => {
  const { user, text } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found' });

    blog.comments.push({ user, text });
    await blog.save();
    res.json({ message: 'Comment added', comments: blog.comments });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

module.exports = router;