const express = require("express");

const Blog = require("../models/blog_model");
const HttpStatusCodes = require("../utils/http_status_codes");

const blogsRouter = express.Router();

blogsRouter.get("/", async (req, res) => {
    try{
        const blogs = await Blog.find();
        res.send(blogs);
    } catch(err){
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: err.message
        });
    }
});

blogsRouter.get('/:id', getBlog, (req, res) => {
    res.json({
        status: 'success',
        data: res.blog
    });
});

blogsRouter.post("/", async (req, res) => {
    const blog = new Blog({
        photoUrl: req.body.photoUrl,
        category: req.body.category,
        title: req.body.title,
        content: req.body.content
    });

    try {
        const newBlog = await blog.save();
        res.status(HttpStatusCodes.CREATED).json({
            status: 'success',
            data: newBlog
        });
    } catch (err) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: err.message
        });
    }
});

async function getBlog(req, res, next) {
    let blog;
    try {
      blog = await Blog.findById(req.params.id);
      if (blog == null) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
            status: 'fail',
            message: 'Cannot find blog'
        });
      }
    } catch (err) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'fail',
        message: err.message
      });
    }
    res.blog = blog;
    next();
}

module.exports = blogsRouter