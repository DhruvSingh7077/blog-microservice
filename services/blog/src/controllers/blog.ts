
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
  console.error("🔥 FULL DATABASE ERROR:", dbError);

  res.status(500).json({
    message: "Error fetching blogs from database",
    error: String(dbError)
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

// ===== GET ALL COMMENTS FOR A BLOG =====
export const getAllComments = TryCatch(async (req: Request, res: Response) => {
  const { id: blogid } = req.params;

  console.log('📥 GET /blogs/:id/comments - Blog ID:', blogid);

  setNoCacheHeaders(res);

  try {
    const comments = await sql`
      SELECT * FROM comments 
      WHERE blogid = ${blogid} 
      ORDER BY created_at DESC
    `;

    console.log(`✅ Fetched ${comments.length} comments`);

    res.json(comments);
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    res.status(500).json({ 
      message: "Error fetching comments", 
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    });
  }
});

// ===== DELETE COMMENT =====
export const deleteComment = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id: commentid } = req.params;

  console.log('📥 DELETE /comments/:id - Comment ID:', commentid);

  setNoCacheHeaders(res);

  if (!req.user?._id) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Check if comment exists and belongs to user
    const comments = await sql`
      SELECT * FROM comments 
      WHERE id = ${commentid} AND userid = ${req.user._id}
    `;

    if (!comments.length) {
      return res.status(404).json({ 
        message: "Comment not found or you don't have permission to delete it" 
      });
    }

    const comment = comments[0] as any; // Type assertion to fix TypeScript error

    // Delete the comment
    await sql`DELETE FROM comments WHERE id = ${commentid}`;

    console.log('✅ Comment deleted successfully');

    // Invalidate blog cache
    if (comment?.blogid) {
      const blogCacheKey = `blog:${comment.blogid}`;
      await safeRedisDel(blogCacheKey);
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    res.status(500).json({ 
      message: "Error deleting comment", 
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    });
  }
});

// ===== SAVE BLOG (Bookmark) =====
export const savedBlog = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id: blogid } = req.params;

  console.log('📥 POST /blogs/:id/save - Blog ID:', blogid);

  setNoCacheHeaders(res);

  if (!req.user?._id) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Check if already saved
    const existing = await sql`
      SELECT * FROM saved_blogs 
      WHERE blogid = ${blogid} AND userid = ${req.user._id}
    `;

    if (existing.length > 0) {
      return res.status(400).json({ message: "Blog already saved" });
    }

    // Save the blog
    await sql`
      INSERT INTO saved_blogs (blogid, userid) 
      VALUES (${blogid}, ${req.user._id})
    `;

    console.log('✅ Blog saved successfully');

    res.json({ message: "Blog saved successfully" });
  } catch (error) {
    console.error('❌ Error saving blog:', error);
    res.status(500).json({ 
      message: "Error saving blog", 
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    });
  }
});

// ===== GET SAVED BLOGS =====
export const getSavedBlog = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  console.log('📥 GET /saved-blogs');

  setNoCacheHeaders(res);

  if (!req.user?._id) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Get saved blog IDs for this user
    const savedBlogs = await sql`
      SELECT sb.*, b.* 
      FROM saved_blogs sb
      JOIN blogs b ON sb.blogid = b.id
      WHERE sb.userid = ${req.user._id}
      ORDER BY sb.created_at DESC
    `;

    console.log(`✅ Fetched ${savedBlogs.length} saved blogs`);

    res.json(savedBlogs);
  } catch (error) {
    console.error('❌ Error fetching saved blogs:', error);
    res.status(500).json({ 
      message: "Error fetching saved blogs", 
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    });
  }
});

// ===== UNSAVE BLOG (Remove Bookmark) =====
export const unsaveBlog = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { id: blogid } = req.params;

  console.log('📥 DELETE /blogs/:id/save - Blog ID:', blogid);

  setNoCacheHeaders(res);

  if (!req.user?._id) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const result = await sql`
      DELETE FROM saved_blogs 
      WHERE blogid = ${blogid} AND userid = ${req.user._id}
      RETURNING *
    `;

    if (!result.length) {
      return res.status(404).json({ message: "Saved blog not found" });
    }

    console.log('✅ Blog unsaved successfully');

    res.json({ message: "Blog removed from saved" });
  } catch (error) {
    console.error('❌ Error unsaving blog:', error);
    res.status(500).json({ 
      message: "Error removing saved blog", 
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