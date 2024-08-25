const express = require("express");

const Blog = require("../models/blog_model");
const HttpStatusCodes = require("../utils/http_status_codes");

const blogsRouter = express.Router();

blogsRouter.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const category = req.query.category;
        const searchTerm = req.query.searchTerm;
        let searchRegex = null;

        let filter = {};

        if (category) {
            filter.categories = { $regex: new RegExp(category, 'i') };
            console.log(filter);
        }

        if (searchTerm) {
            searchRegex = new RegExp(searchTerm, 'i');
            filter.$or = [{ title: searchRegex }, { content: searchRegex }];
            console.log(filter);       
        }

        const totalBlogs = await Blog.countDocuments(filter);
        const totalPages = Math.ceil(totalBlogs / limit);

        if (page > totalPages && totalBlogs > 0) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                status: 'fail',
                message: 'Page not found'
            });
        }

        const blogs = await Blog.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(HttpStatusCodes.OK).json({
            status: 'success',
            requestTime: req.requestTime,
            results: blogs.length,
            totalResults: totalBlogs,
            currentPage: page,
            totalPages: totalPages,
            data: {
                blogs
            }
        });
    } catch (err) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: err.message
        });
    }
});

blogsRouter.get('/categories', async (req, res) => {
    try {
        const categories = await Blog.distinct('categories');

        res.status(HttpStatusCodes.OK).json({
            status: 'success',
            data: {
                categories
            }
        });
    } catch (err) {
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
        categories: req.body.categories,
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

blogsRouter.put('/:id', getBlog, async (req, res) => {
    if (req.body.photoUrl != null) {
        res.blog.photoUrl = req.body.photoUrl;
    }
    if (req.body.categories != null) {
        res.blog.categories = req.body.categories;
    }
    if (req.body.title != null) {
        res.blog.title = req.body.title;
    }
    if (req.body.content != null) {
        res.blog.content = req.body.content;
    }

    try {
        const updatedBlog = await res.blog.save();
        res.status(HttpStatusCodes.OK).json({
            status: 'success',
            data: updatedBlog
        });
    } catch (err) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: err.message
        });
    }
});

blogsRouter.delete('/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                status: 'fail',
                message: 'Cannot find blog'
            });
        }
        res.status(HttpStatusCodes.NO_CONTENT).json({
            status: 'success',
            message: 'Blog deleted successfully'
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