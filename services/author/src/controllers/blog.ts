import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";
import blog from "../routes/blog.js";
import { invalidateCacheJob } from "../utils/rabbitmq.js";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  await invalidateCacheJob(["blogs:*"]);

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

  await invalidateCacheJob(["blogs:*", `blog:${id}`]);
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

  await invalidateCacheJob(["blogs:*", `blog:${req.params.id}`]);
  res.json({
    message: "Blog deleted successfully",
  });
});


export const aiTitleResponse = TryCatch(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }

  const prompt = `Correct the grammar of the following blog title and return only the corrected title without any additional text, formatting, or symbols: "${text}"`;

  const ai = new GoogleGenAI({
    apiKey: process.env.Gemini_Api_Key as string,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  // Adjust depending on exact SDK version
  const raw =
    response.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text ?? "")
      .join("") ?? "";

  if (!raw.trim()) {
    return res.status(400).json({ message: "AI generation failed" });
  }

  const cleaned = raw
    .replace(/\*\*/g, "")
    .replace(/[\r\n]+/g, "")
    .replace(/[*_`~]/g, "")
    .trim();

  return res.json({ title: cleaned });
});
export const aiDescriptionResponse = TryCatch(async (req, res) => {
  const { title, description } = req.body;

  const prompt =
    description === ""
      ? `Generate only one short blog description based on
this title: "${title}". Your response must be only one sentence, strictly under 30 words, with no options, no
greetings, and no extra text. Do not explain. Do not say 'here is'. Just return the description only.`
      : `Fix the
grammar in the following blog description and return only the corrected sentence. Do not add anything else:
"${description}"`;

  const ai = new GoogleGenAI({
    apiKey: process.env.Gemini_Api_Key as string,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  // Adjust depending on exact SDK version
  const raw =
    response.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text ?? "")
      .join("") ?? "";

  if (!raw.trim()) {
    return res.status(400).json({ message: "AI generation failed" });
  }

  const cleaned = raw
    .replace(/\*\*/g, "")
    .replace(/[\r\n]+/g, "")
    .replace(/[*_`~]/g, "")
    .trim();

  return res.json({ title: cleaned });
});
export const aiBlogResponse = TryCatch(async (req, res) => {
  const prompt = ` You will act as a grammar correction engine. I will provide you with blog content
in rich HTML format (from Jodit Editor). Do not generate or rewrite the content with new ideas. Only correct
grammatical, punctuation, and spelling errors while preserving all HTML tags and formatting. Maintain inline styles,
image tags, line breaks, and structural tags exactly as they are. Return the full corrected HTML string as output. `;

  const { blog } = req.body;
  if (!blog) {
    res.status(400).json({
      message: "please provide blog",
    });
    return;
  }

  const fullMessage = `${prompt}\n\n${blog}`;

  const ai = new GoogleGenerativeAI(process.env.Gemini_Api_key as string);

  const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: fullMessage,
          },
        ],
      },
    ],
  });

  const responseText = await result.response.text();

  const cleanedHtml = responseText
    .replace(/^(html|```html|```)\n?/i, "")
    .replace(/```$/i, "")
    .replace(/\*\*/g, "")
    .replace(/[\r\n]+/g, "")
    .replace(/[*_`~]/g, "")
    .trim();

  res.status(200).json({ html: cleanedHtml });
});
