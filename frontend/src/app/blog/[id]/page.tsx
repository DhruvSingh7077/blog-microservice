"use client";
import React, { useEffect } from "react";
import { useAppData, Blog, User, blog_service } from "@/context/AppContext";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import Loading from "@/components/loading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bookmark, Edit, Trash2Icon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
const BlogPage = () => {
  const { isAuth, user } = useAppData();
  const router = useRouter();
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  type SingleBlogResponse = {
    blog: Blog;
    author: User;
  };
  async function fetchSingleBlog() {
    setLoading(true);
    try {
      const { data } = await axios.get<SingleBlogResponse>(
        `${blog_service}/api/v1/blog/${id}`
      );
      setBlog(data.blog);
      setAuthor(data.author);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSingleBlog();
  }, [id]);

  if (!blog) {
    return <Loading />;
  }
  // Put logs here:
  console.log("user", user);
  console.log("blog.author", blog.author);
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
          <p className="text-gray-600 mt-2 flex items-center">
            <Link
              className="flex items-center gap-2"
              href={`/profile/${author?._id}`}
            >
              <img
                src={author?.image}
                className="w-8 h-8 rounded-full"
                alt=""
              />
              {author?.name}
            </Link>
            {isAuth && (
              <Button variant={"ghost"} className="mx-3" size={"lg"}>
                <Bookmark />
              </Button>
            )}
            {blog.author === user?._id && (
              <>
                <Button
                  size={"sm"}
                  onClick={() => router.push(`/blog/edit/${id}`)}
                >
                  <Edit />
                </Button>
                <Button variant={"destructive"} className="mx-2" size={"sm"}>
                  <Trash2Icon />
                </Button>
              </>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <img
            src={blog.image}
            alt=""
            className="w-full h-64 oject-cover rounded-lg mb-4"
          />
          <p className="text-lg text-gray-700 mb-4">{blog.description}</p>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.blogcontent }}
          />
        </CardContent>
      </Card>
      {isAuth && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Leave a comment</h3>
          </CardHeader>
          <CardContent>
            <Label htmlFor="comment">Your Comment</Label>
            <Input
              id="comment"
              placeholder="Type your comment here"
              className="my-2"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogPage;
