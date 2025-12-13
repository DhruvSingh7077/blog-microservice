import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";
import { createBlog, updateBlog, deleteBlog } from "../controllers/blog.js";
const router = express();

router.post("/blog/new", isAuth, uploadFile, createBlog);
router.post("/blog/:id", isAuth, uploadFile, updateBlog);
router.delete("/blog/:id", isAuth, deleteBlog);
export default router;
