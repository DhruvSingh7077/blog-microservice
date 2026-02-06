// import { sql } from "../utils/db.js";
// import TryCatch from "../utils/TryCatch.js";
// import axios from "axios";
// import { redisClient } from "../server.js";
// import type { AuthenticatedRequest } from "../middleware/isAuth.js";

// export const getAllBlogs = TryCatch(async (req, res) => {
//   const { searchQuery = "", category = "" } = req.query;

//   const cacheKey = `blogs:${searchQuery}:${category}`;

//   const cached = await redisClient.get(cacheKey);

//   if (cached) {
//     console.log("Serving from cache");
//     res.json(JSON.parse(cached));
//     return;
//   }
//   let blogs;

//   if (searchQuery && category) {
//     blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${
//       "%" + searchQuery + "%"
//     } OR description ILIKE ${
//       "%" + searchQuery + "%"
//     }) AND category = ${category} ORDER BY create_at DESC`;
//   } else if (searchQuery) {
//     blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${
//       "%" + searchQuery + "%"
//     } OR description ILIKE ${
//       "%" + searchQuery + "%"
//     })  ORDER BY create_at DESC`;
//   } else if (category) {
//     blogs = await sql`SELECT * FROM blogs WHERE category=${category} 
//       ORDER BY create_at DESC`;
//   } else {
//     blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;
//   }

//   console.log("Serving from database");

//   await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });
//   res.json(blogs);
// });

// export const getSingleBlog = TryCatch(async (req, res) => {
//   const blogid = req.params.id;

//   const cacheKey = `blog:${blogid}`;

//   const cached = await redisClient.get(cacheKey);

//   if (cached) {
//     console.log("Serving single blog from cache");
//     res.json(JSON.parse(cached));
//     return;
//   }

//   const blogs = await sql`SELECT * FROM blogs WHERE id = ${blogid}`;

//   if (!blogs.length) {
//     res.status(404).json({ message: "Blog not found with this id" });
//     return;
//   }

//   const currentBlog = blogs[0] as Record<string, any>; // or your Blog type

//   const { data } = await axios.get(
//     `${process.env.USER_SERVICE}/api/v1/user/${currentBlog.author}`
//   );

//   const responseData = { blog: currentBlog, author: data };

//   await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });
//   res.json(responseData);
// });

// export const addComment = TryCatch(async (req: AuthenticatedRequest, res) => {
//   const { id: blogid } = req.params;

//   const { comment } = req.body;

//   await sql`INSERT INTO comments (comment, blogid, userid, username) VALUES (${comment}, ${blogid}, ${req.user?._id}, ${req.user?.name}) RETURNING *`;
//   res.json({
//     message: "Comment Added",
//   });
// });
// export const getAllComments = TryCatch(async (req, res) => {
//   const { id } = req.params;
//   const comments =
//     await sql`SELECT * FROM comments WHERE blogid = ${id} ORDER BY create_at DESC`;

//   res.json(comments);
// });

// export const deleteComment = TryCatch(
//   async (req: AuthenticatedRequest, res) => {
//     const { commentid } = req.params;

//     const comment = await sql`SELECT * FROM comments WHERE id = ${commentid}`;

//     if (comment?.[0]?.userid !== req.user?._id) {
//       return res
//         .status(401)
//         .json({ message: "You are not authorized to delete this comment" });
//     }

//     await sql`DELETE FROM comments WHERE id = ${commentid}`;

//     res.json({ message: "Comment deleted successfully" });
//   }
// );
// export const savedBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
//   const { blogid } = req.params;
//   const userid = req.user?._id;

//   if (!blogid || !userid) {
//     res.status(400).json({
//       message: "Missing blog id or userid",
//     });
//     return;
//   }
//   const existing =
//     await sql`SELECT * FROM savedblogs WHERE userid = ${userid} AND blogid = ${blogid}`;

//   if (existing.length === 0) {
//     await sql`INSERT INTO savedblogs (blogid, userid) VALUES (${blogid}, ${userid})`;
//     res.json({
//       message: "Blog Saved",
//     });
//     return;
//   } else {
//     await sql`DELETE FROM savedblogs WHERE userid = ${userid} AND blogid = ${blogid}`;

//     res.json({
//       message: "Blog UnSaved",
//     });
//     return;
//   }
// });

// export const getSavedBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
//   const blogs =
//     await sql`SELECT * FROM savedblogs WHERE userid = ${req.user?._id}`;
//   res.json(blogs);
// });
import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";
import { redisClient } from "../server.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import type { Request, Response } from "express";

// ===== Helper Function: Set No-Cache Headers =====
const setNoCacheHeaders = (res: Response) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
};

// ===== Helper Function: Safe Redis Get =====
const safeRedisGet = async (key: string) => {
  try {
    if (!redisClient.isReady) {
      console.log('⚠️  Redis not ready, skipping cache');
      return null;
    }
    return await redisClient.get(key);
  } catch (error) {
    console.error('❌ Redis GET error:', error);
    return null;
  }
};

// ===== Helper Function: Safe Redis Set =====
const safeRedisSet = async (key: string, value: string, options?: any) => {
  try {
    if (!redisClient.isReady) {
      console.log('⚠️  Redis not ready, skipping cache set');
      return;
    }
    await redisClient.set(key, value, options);
  } catch (error) {
    console.error('❌ Redis SET error:', error);
  }
};

// ===== Helper Function: Safe Redis Delete =====
const safeRedisDel = async (key: string) => {
  try {
    if (!redisClient.isReady) {
      return;
    }
    await redisClient.del(key);
  } catch (error) {
    console.error('❌ Redis DEL error:', error);
  }
};

// ===== GET ALL BLOGS =====
export const getAllBlogs = TryCatch(async (req: Request, res: Response) => {
  const { searchQuery = "", category = "" } = req.query;

  console.log('📥 GET /blogs - Query:', { searchQuery, category });

  // Set no-cache headers to prevent 304 responses
  setNoCacheHeaders(res);

  const cacheKey = `blogs:${searchQuery}:${category}`;

  // Try to get from Redis cache
  const cached = await safeRedisGet(cacheKey);

  if (cached) {
    console.log('✅ Serving from Redis cache');
    const parsedCache = JSON.parse(cached);
    
    // Ensure cache has valid data
    if (Array.isArray(parsedCache) && parsedCache.length > 0) {
      return res.json(parsedCache);
    } else {
      console.log('⚠️  Cache was empty/invalid, deleting and fetching fresh');
      await safeRedisDel(cacheKey);
    }
  }

  // Fetch from database
  let blogs;

  try {
    if (searchQuery && category) {
      blogs = await sql`
        SELECT * FROM blogs 
        WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"}) 
        AND category = ${category} 
        ORDER BY created_at DESC
      `;
    } else if (searchQuery) {
      blogs = await sql`
        SELECT * FROM blogs 
        WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"})  
        ORDER BY created_at DESC
      `;
    } else if (category) {
      blogs = await sql`
        SELECT * FROM blogs 
        WHERE category = ${category} 
        ORDER BY created_at DESC
      `;
    } else {
      blogs = await sql`
        SELECT * FROM blogs 
        ORDER BY created_at DESC
      `;
    }

    console.log(`✅ Fetched ${blogs.length} blogs from database`);

    // Cache the results if we have data
    if (blogs && blogs.length > 0) {
      await safeRedisSet(cacheKey, JSON.stringify(blogs), { EX: 3600 });
      console.log('💾 Cached blogs in Redis');
    }

    res.json(blogs);
  } catch (dbError) {
    console.error('❌ Database error in getAllBlogs:', dbError);
    res.status(500).json({ 
      message: "Error fetching blogs from database", 
      error: process.env.NODE_ENV === 'development' ? String(dbError) : undefined 
    });
  }
});

// ===== GET SINGLE BLOG =====
export const getSingleBlog = TryCatch(async (req: Request, res: Response) => {
  const blogid = req.params.id;

  console.log('📥 GET /blogs/:id - Blog ID:', blogid);

  // Set no-cache headers
  setNoCacheHeaders(res);

  const cacheKey = `blog:${blogid}`;

  // Try cache first
  const cached = await safeRedisGet(cacheKey);

  if (cached) {
    console.log('✅ Serving single blog from Redis cache');
    const parsedCache = JSON.parse(cached);
    if (parsedCache && parsedCache.blog) {
      return res.json(parsedCache);
    } else {
      console.log('⚠️  Invalid cache data, deleting');
      await safeRedisDel(cacheKey);
    }
  }

  try {
    // Fetch blog from database
    const blogs = await sql`SELECT * FROM blogs WHERE id = ${blogid}`;

    if (!blogs.length) {
      console.log('❌ Blog not found:', blogid);
      return res.status(404).json({ message: "Blog not found with this id" });
    }

    const currentBlog = blogs[0] as Record<string, any>;
    console.log('✅ Found blog:', currentBlog.title);

    // Fetch author data with timeout and error handling
    let authorData = null;
    try {
      const userServiceUrl = `${process.env.USER_SERVICE}/api/v1/user/${currentBlog.author}`;
      console.log('📞 Fetching author from:', userServiceUrl);
      
      const { data } = await axios.get(userServiceUrl, { 
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      authorData = data;
      console.log('✅ Author data fetched successfully');
    } catch (authorError: any) {
      console.error('❌ Error fetching author:', authorError.message);
      // Provide fallback author data
      authorData = { 
        _id: currentBlog.author, 
        name: "Unknown Author",
        error: "Could not fetch author details"
      };
    }

    const responseData = { blog: currentBlog, author: authorData };

    // Cache the successful response
    await safeRedisSet(cacheKey, JSON.stringify(responseData), { EX: 3600 });
    console.log('💾 Cached single blog in Redis');

    res.json(responseData);
  } catch (error) {
    console.error('❌ Error in getSingleBlog:', error);
    res.status(500).json({ 
      message: "Error fetching blog", 
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    });
  }
});

// ===== ADD COMMENT =====
export const addComment = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id: blogid } = req.params;
  const { comment } = req.body;

  console.log('📥 POST /blogs/:id/comment - Blog ID:', blogid);

  setNoCacheHeaders(res);

  // Validation
  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  if (!req.user?._id || !req.user?.name) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const result = await sql`
      INSERT INTO comments (comment, blogid, userid, username) 
      VALUES (${comment}, ${blogid}, ${req.user._id}, ${req.user.name}) 
      RETURNING *
    `;

    console.log('✅ Comment added successfully');

    // Invalidate blog cache since comments changed
    const blogCacheKey = `blog:${blogid}`;
    await safeRedisDel(blogCacheKey);
    console.log('🗑️  Invalidated blog cache');

    res.json({
      message: "Comment Added",
      comment: result[0],
    });
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({ 
      message: "Error adding comment", 
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    });
  }
});

// ===== CLEAR CACHE (Admin/Debug Endpoint) =====
export const clearBlogCache = TryCatch(async (req: Request, res: Response) => {
  try {
    if (!redisClient.isReady) {
      return res.status(503).json({ message: "Redis not available" });
    }

    const blogKeys = await redisClient.keys('blog:*');
    const blogsKeys = await redisClient.keys('blogs:*');
    const allKeys = [...blogKeys, ...blogsKeys];
    
    if (allKeys.length > 0) {
      await redisClient.del(allKeys);
      console.log(`🗑️  Cleared ${allKeys.length} cache entries`);
      res.json({ 
        message: `Successfully cleared ${allKeys.length} cache entries`,
        keys: allKeys 
      });
    } else {
      res.json({ message: "No cache entries to clear" });
    }
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    res.status(500).json({ 
      message: "Error clearing cache",
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    });
  }
});