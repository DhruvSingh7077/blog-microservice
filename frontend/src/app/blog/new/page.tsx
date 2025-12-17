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

import { author_service } from "@/context/AppContext";
import toast from "react-hot-toast";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const blogCategories = [
  "Technology",
  "Health",
  "Travel",
  "Education",
  "Entertainment",
  "Study",
  "Finance",
];
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
    console.log("==============================================");
    console.log("🚀 FORM SUBMISSION STARTED");
    console.log("==============================================");

    setLoading(true);

    const formDataToSend = new FormData();

    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("blogcontent", content);

    if (formData.image) {
      formDataToSend.append("file", formData.image);
    }
    console.log("📝 Form Data to Send:");
    console.log("  - Title:", formData.title);
    console.log("  - Description:", formData.description);
    console.log("  - Category:", formData.category);
    console.log("  - Content Length:", content.length, "characters");
    console.log("  - Has Image:", !!formData.image);

    try {
      const token = Cookies.get("token");

      console.log("🔑 Authentication:");
      console.log("  - Token exists:", !!token);
      if (token) {
        console.log("  - Token preview:", token.substring(0, 20) + "...");
      } else {
        console.log("  - ⚠️ NO TOKEN FOUND!");
      }
      console.log("🌐 API Request:");
      console.log("  - Author Service URL:", author_service);
      console.log("  - Full Endpoint:", `${author_service}/api/v1/blog/new`);
      console.log("  - Method: POST");
      console.log("  - Content-Type: multipart/form-data");
      console.log("⏳ Sending request...");

      const response = await axios.post<BlogApiResponse>(
        `${author_service}/api/v1/blog/new`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("==============================================");
      console.log("✅ SUCCESS!");
      console.log("==============================================");
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);
      console.log("Response Message:", response.data.message);

      toast.success(response.data.message);
      const data = response.data;
      toast.success(data.message);
      console.log("🔄 Resetting form...");
      setFormData({
        title: "",
        description: "",
        category: "",
        image: null,
        blogcontent: "",
      });
      setContent("");
      console.log("✅ Form reset complete");
    } catch (err) {
      // Log the raw error
      console.error("❌ API ERROR RAW:", err);

      // Try to read typical axios fields safely
      const anyErr = err as any;
      const status = anyErr?.response?.status;
      const data = anyErr?.response?.data;
      const message =
        data?.message || anyErr?.message || "Error while adding blog";

      console.error("❌ API ERROR:", { status, data, message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: "Start typings...",
    }),
    []
  );
  console.log("🎨 Component Rendered - Current State:", {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    hasImage: !!formData.image,
    contentLength: content.length,
    loading: loading,
  });
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
                required
              />
              <Button type="button">
                <RefreshCw />
              </Button>
            </div>
            <Label>Description</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter Blog description"
                required
              />
              <Button type="button">
                <RefreshCw />
              </Button>
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
                <Button type="button" size={"sm"}>
                  <RefreshCw size={16} />
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
