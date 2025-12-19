"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Input } from "./ui/input";
import { BoxSelect } from "lucide-react";
import { blogCategories } from "@/app/blog/new/page";
import { useAppData } from "@/context/AppContext";

const SideBar = () => {
  const { searchQuery, setCategory, setSearchQuery } = useAppData();
  return (
    <Sidebar>
      <SidebarHeader className="bg-white text-2xl font-bold mt-5">
        the reading reretreat
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>Search</SidebarGroupLabel>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your blog "
            className="w-full mb-4"
          />
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setCategory("")}>
                <BoxSelect />
                <span>All</span>
              </SidebarMenuButton>
              {blogCategories.map((e, i) => {
                return (
                  <SidebarMenuButton key={i} onClick={() => setCategory(e)}>
                    <BoxSelect />
                    <span>{e}</span>
                  </SidebarMenuButton>
                );
              })}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
