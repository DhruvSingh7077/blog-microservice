"use client";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppData } from "@/context/AppContext";
import { Filter } from "lucide-react";
import React from "react";

const Blogs = () => {
  const { toggleSidebar } = useSidebar();
  const { loading, blogLoading, blogs } = useAppData();

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="container mx-auto px-4">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center my-5">
              <h1 className="text-3xl font-bold">Latest Blogs</h1>
              <Button
                onClick={toggleSidebar}
                className="flex items-center gap-2 px-4 bg-primary text-white"
              >
                <Filter size={18} />
                <span>Filters</span>
              </Button>
            </div>
          </div>
          {blogLoading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 mg:grid-cols-3 lg:grid-cols-4">
              {blogs?.length === 0 && <p>No Blogs yet</p>}
              {blogs &&
                blogs.map((e, i) => {
                  return <p key={i}>{e.title}</p>;
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Blogs;
