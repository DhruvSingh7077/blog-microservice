"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Input } from "./ui/input";
import { Layers3, Sparkles } from "lucide-react";

import { useAppData, blogCategories } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const SideBar = () => {
  const { searchQuery, setCategory, setSearchQuery, category } = useAppData();

  return (
    <Sidebar className="border-r border-red-900/40 bg-[#050509]">
      {/* Brand + search */}
      <SidebarHeader className="space-y-5 px-6 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold tracking-tight text-slate-50">
            The <span className="font-bold text-red-400">Reading</span> Retreat
          </div>
          <Sparkles className="h-5 w-5 text-red-400/80" />
        </div>

        <div className="space-y-2">
          <SidebarGroupLabel className="text-xs font-medium text-slate-400">
            Search
          </SidebarGroupLabel>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your blog..."
            className="h-10 rounded-2xl border-red-900/40 bg-[#0b0b12] text-sm text-slate-100 shadow-sm placeholder:text-slate-500"
          />
        </div>
      </SidebarHeader>

      {/* Categories */}
      <SidebarContent className="px-5 pb-6">
        <SidebarGroup className="space-y-4">
          <p className="flex items-center gap-2 px-1 text-xs font-semibold text-slate-400">
            <Layers3 className="h-4 w-4 text-red-400/80" />
            Categories
          </p>

          <SidebarMenu>
            <SidebarMenuItem>
              <div className="rounded-3xl bg-[#070711] px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.7)] ring-1 ring-red-900/40">
                <p className="mb-3 text-xs font-semibold text-slate-300">
                  Browse by topic
                </p>

                <div className="space-y-2">
                  {/* All */}
                  <button
                    onClick={() => setCategory("")}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-4 py-2 text-sm transition-colors",
                      category === ""
                        ? "bg-red-500 text-slate-50 shadow-sm"
                        : "text-slate-300 hover:bg-red-500/10 hover:text-red-100"
                    )}
                  >
                    <span>All</span>
                  </button>

                  {/* Individual categories */}
                  {blogCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl px-4 py-2 text-sm transition-colors",
                        category === cat
                          ? "bg-red-500 text-slate-50 shadow-sm"
                          : "text-slate-300 hover:bg-red-500/10 hover:text-red-100"
                      )}
                    >
                      <span>{cat}</span>
                      {/* optional badge for counts later */}
                      {/* <span className="ml-2 inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-red-500/20 px-2 text-[10px] font-semibold text-red-200">
                        8
                      </span> */}
                    </button>
                  ))}
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
