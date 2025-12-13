import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";
import blog from "../routes/blog.js";
export const createBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, blogcontent, category } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400).json({
      message: "No file to upload",
    });
    return;
  }

  const fileBuffer = getBuffer(file);
  if (!fileBuffer || !fileBuffer.content) {
    res.status(400).json({
      message: "fail to create buffer",
    });
    return;
  }

  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
    folder: "blogs",
  });

  const result = await sql`
    INSERT INTO blogs (title, description, blogcontent, image, category, author)
    VALUES (${title}, ${description}, ${blogcontent}, ${cloud.secure_url}, ${category}, ${req.user?._id})
    RETURNING *;
  `;

  res.json({
    message: "Blog created successfully",
    blog: result[0],
  });
});

export const updateBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;

  const blogRows = await sql`
    SELECT * FROM blogs WHERE id = ${id} `;

  if (!blogRows.length) {
    res.status(404).json({
      message: "Blog not found",
    });
    return;
  }

  const currentBlog = blogRows[0] as Record<string, any>;

  if (currentBlog.author !== req.user?._id) {
    res.status(401).json({
      message: "You are not authorized to update this blog",
    });
    return;
  }

  let imageUrl = currentBlog.image;
  if (file) {
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({
        message: "fail to create buffer",
      });
      return;
    }
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });
    imageUrl = cloud.secure_url;
  }
  const updatedBlog = await sql`
      UPDATE blogs
      SET title = ${title || currentBlog.title}, description = ${
    title || currentBlog.description
  },image = ${imageUrl}, blogcontent = ${
    title || currentBlog.blogcontent
  }, category = ${title || currentBlog.category}
      WHERE id = ${id}
      RETURNING *;
    `;
  res.json({
    message: "Blog updated successfully",
    blog: updatedBlog[0],
  });
});

export const deleteBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const blogRows = await sql`SELECT * FROM blogs WHERE id = ${req.params.id}`;
  if (!blogRows.length) {
    res.status(404).json({
      message: "Blog not found",
    });
    return;
  }

  const currentBlog = blogRows[0] as Record<string, any>;

  if (currentBlog.author !== req.user?._id) {
    res.status(401).json({
      message: "You are not authorized to update this blog",
    });
    return;
  }

  await sql`DELETE FROM  savedblogs WHERE id = ${req.params.id}`;
  await sql`DELETE FROM  comments WHERE id = ${req.params.id}`;
  await sql`DELETE FROM  blogs WHERE id = ${req.params.id}`;

  res.json({
    message: "Blog deleted successfully",
  });
});
