// import express from "express";
// import {
//   addComment,
//   deleteComment,
//   getAllBlogs,
//   getAllComments,
//   getSavedBlog,
//   getSingleBlog,
//   savedBlog,
// } from "../controllers/blog.js";
// import { isAuth } from "../middleware/isAuth.js";
// const router = express.Router();

// router.get("/blog/all", getAllBlogs);
// router.get("/blog/:id", getSingleBlog);
// router.post("/comment/:id", isAuth, addComment);
// router.get("/comment/:id", getAllComments);
// router.delete("/comment/:commentid", isAuth, deleteComment);
// router.post("/save/:blogid", isAuth, savedBlog);
// router.get("/blog/saved/all", isAuth, getSavedBlog);
// export default router;
import express from "express";
import {
  addComment,
  deleteComment,
  getAllBlogs,
  getAllComments,
  getSavedBlog,
  getSingleBlog,
  savedBlog,
} from "../controllers/blog.js";
import { isAuth } from "../middleware/isAuth.js";
const router = express.Router();

router.get("/", getAllBlogs);                    // GET /api/v1/blogs
router.get("/:id", getSingleBlog);                // GET /api/v1/blogs/:id
router.post("/:id/comment", isAuth, addComment);  // POST /api/v1/blogs/:id/comment
router.get("/:id/comments", getAllComments);      // GET /api/v1/blogs/:id/comments
router.delete("/comment/:commentid", isAuth, deleteComment);
router.post("/:blogid/save", isAuth, savedBlog);
router.get("/saved", isAuth, getSavedBlog);       // GET /api/v1/blogs/saved

export default router;