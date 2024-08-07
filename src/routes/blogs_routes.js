const express = require("express");

const Blog = require("../models/blog_model");
const HttpStatusCodes = require("../utils/http_status_codes");

const blogsRouter = express.Router();

blogsRouter.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const searchTerm = req.query.searchTerm;
        let searchRegex = null;

        let query = Blog.find();

        if (searchTerm) {
            searchRegex = new RegExp(searchTerm, 'i'); 
            query = query.or([{ title: searchRegex }, { content: searchRegex }]);
        }

        query = query.skip(skip).limit(limit);

        const blogs = await query.select('-__v');

        const totalBlogs = await Blog.countDocuments(searchTerm ? {
            $or: [{ title: searchRegex }, { content: searchRegex }]
        } : {});

        const totalPages = Math.ceil(totalBlogs / limit);

        if (page > totalPages) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                status: 'fail',
                message: 'Page not found'
            });
        }

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

// blogsRouter.get("/", async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 5;
//         const skip = (page - 1) * limit;

//         const category = req.query.category;

//         let query = Blog.find();

//         if (category) {
//             query = query.where('categories').in([category]);
//         }

//         query = query.skip(skip).limit(limit);

//         const blogs = await query.select('-__v');

//         const totalBlogs = await Blog.countDocuments(category ? { categories: { $in: [category] } } : {});
//         const totalPages = Math.ceil(totalBlogs / limit);

//         if (page > totalPages) {
//             return res.status(HttpStatusCodes.BAD_REQUEST).json({
//                 status: 'fail',
//                 message: 'Page not found'
//             });
//         }

//         res.status(HttpStatusCodes.OK).json({
//             status: 'success',
//             requestTime: req.requestTime,
//             results: blogs.length,
//             totalResults: totalBlogs,
//             currentPage: page,
//             totalPages: totalPages,
//             data: {
//                 blogs
//             }
//         });
//     } catch (err) {
//         res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// });

// blogsRouter.get("/", async (req, res) => {
//     try{
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 5;
//         const skip = (page - 1) * limit;

//         const query = Blog.find().skip(skip).limit(limit);
//         const blogs = await query.select('-__v');

//         const totalBlogs = await Blog.countDocuments();
//         const totalPages = Math.ceil(totalBlogs / limit);

//         if(page > totalPages){
//             return res.status(HttpStatusCodes.BAD_REQUEST).json({
//                 status: 'fail',
//                 message: 'Page not found'
//             });
//         }

//         res.status(HttpStatusCodes.OK).json({
//             status: 'success',
//             requestTime: req.requestTime,
//             results: blogs.length,
//             totalResults: totalBlogs,
//             currentPage: page,
//             totalPages: totalPages,
//             data: {
//                 blogs
//             }
//         })
//     } catch(err){
//         res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// });

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

// blogsRouter.post("/", async (req, res) => {
//     const blog = new Blog({
//         photoUrl: req.body.photoUrl,
//         category: req.body.category,
//         title: req.body.title,
//         content: req.body.content
//     });

//     try {
//         const newBlog = await blog.save();
//         res.status(HttpStatusCodes.CREATED).json({
//             status: 'success',
//             data: newBlog
//         });
//     } catch (err) {
//         res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
//             status: 'fail',
//             message: err.message
//         });
//     }
// });

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