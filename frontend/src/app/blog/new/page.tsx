"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
// import JoditEditor from "jodit-react";
import Cookies from "js-cookie";
import axios from "axios";

import {
  author_service,
  useAppData,
  blogCategories,
} from "@/context/AppContext";
import toast from "react-hot-toast";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

// Define the API response type
interface BlogApiResponse {
  message: string;
  success: boolean;
  blog?: {
    id: string;
    title: string;
  };
}

const AddBlog = () => {
  console.log("author_service frontend =", author_service);
  const editor = useRef(null);
  const [content, setContent] = useState("");

  const { fetchBlogs } = useAppData();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null as File | null,
    blogcontent: "",
  });

  const handleInputChange = (e: any) => {
    console.log("Input changed:", e.target.name, "=", e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    console.log(
      "File selected:",
      file?.name,
      "Size:",
      file?.size,
      "Type:",
      file?.type
    );
    setFormData({ ...formData, image: file });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setLoading(true);

    const formDataToSend = new FormData();

    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("blogcontent", content);

    if (formData.image) {
      formDataToSend.append("file", formData.image);
    }

    try {
      const token = Cookies.get("token");
      const response = await axios.post<BlogApiResponse>(
        `${author_service}/api/v1/blog/new`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);
      const data = response.data;
      toast.success(data.message);

      setFormData({
        title: "",
        description: "",
        category: "",
        image: null,
        blogcontent: "",
      });
      setContent("");
      setTimeout(() => {
        fetchBlogs();
      }, 4000);
    } catch (err) {
      // Log the raw error
      console.error("❌ API ERROR RAW:", err);
      toast.error("Error while adding blog");
    } finally {
      setLoading(false);
    }
  };

  const [aiTitle, setAiTitle] = useState(false);

  const aiTitleResponse = async () => {
    try {
      setAiTitle(true);
      const { data } = await axios.post(`${author_service}/api/v1/ai/title`, {
        text: formData.title,
      });
      setFormData({ ...formData, title: data as string });
    } catch (error) {
      toast.error("Problem while fetching from ai");
      console.log(error);
    } finally {
      setAiTitle(false);
    }
  };
  const [aiDescription, setAiDescription] = useState(false);

  const aiDescriptionResponse = async () => {
    try {
      setAiTitle(true);
      const { data } = await axios.post(`${author_service}/api/v1/ai/title`, {
        text: formData.title,
        description: formData.description,
      });
      setFormData({ ...formData, description: data as string });
    } catch (error) {
      toast.error("Problem while fetching from ai");
      console.log(error);
    } finally {
      setAiDescription(false);
    }
  };
  const [aiBlogLoading, setAiBlogLoading] = useState(false);
  type AiBlogResponse = {
    html: string;
  };

  const aiBlogResponse = async () => {
    try {
      setAiBlogLoading(true);
      const { data } = await axios.post<AiBlogResponse>(
        `${author_service}/api/v1/ai/blog`,
        {
          blog: formData.blogcontent,
        }
      );
      setContent(data.html as string);
      setFormData({ ...formData, blogcontent: data.html as string });
    } catch (error) {
      toast.error("Problem while fetching from ai");
      console.log(error);
    } finally {
      setAiBlogLoading(false);
    }
  };
  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: "Start typings...",
    }),
    []
  );
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Add new blog</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Title</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter Blog title"
                className={
                  aiTitle ? "animate-pulse placeholder:opacity-60" : ""
                }
                required
              />
              {formData.title === "" ? (
                ""
              ) : (
                <Button
                  type="button"
                  onClick={aiTitleResponse}
                  disabled={aiTitle}
                >
                  <RefreshCw className={aiTitle ? "animate-spin" : ""} />
                </Button>
              )}
            </div>
            <Label>Description</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter Blog description"
                className={
                  aiDescription ? "animate-pulse placeholder:opacity-60" : ""
                }
                required
              />
              {formData.title === "" ? (
                ""
              ) : (
                <Button
                  onClick={aiDescriptionResponse}
                  type="button"
                  disabled={aiDescription}
                >
                  <RefreshCw className={aiDescription ? "animate-spin" : ""} />
                </Button>
              )}
            </div>

            <Label>Category</Label>
            <Select
              onValueChange={(value: any) =>
                setFormData({
                  ...formData,
                  category: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={formData.category || "Select Category"}
                />
              </SelectTrigger>
              <SelectContent>
                {blogCategories?.map((e, i) => (
                  <SelectItem key={i} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <Label>Image Upload</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div>
              <Label>Blog Content</Label>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
                  Paste you blog or type here. you can use rich text formatting,
                  Please add image after improving your grammar
                </p>
                <Button
                  type="button"
                  size={"sm"}
                  onClick={aiBlogResponse}
                  disabled={aiBlogLoading}
                >
                  <RefreshCw
                    size={16}
                    className={aiBlogLoading ? "animate-spin" : ""}
                  />
                  <span className="ml-2">Fix Grammar</span>
                </Button>
              </div>
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={(newContent) => {
                  setContent(newContent);
                  setFormData({ ...formData, blogcontent: newContent });
                }}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting" : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBlog;
