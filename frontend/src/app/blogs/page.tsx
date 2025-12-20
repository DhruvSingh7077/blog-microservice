// // "use client";
// // import BlogCard from "@/components/BlogCard";
// // import Loading from "@/components/loading";
// // import { Button } from "@/components/ui/button";
// // import { useSidebar } from "@/components/ui/sidebar";
// // import { useAppData } from "@/context/AppContext";
// // import { Filter } from "lucide-react";
// // import React from "react";

// // const Blogs = () => {
// //   const { toggleSidebar } = useSidebar();
// //   const { loading, blogLoading, blogs } = useAppData();

// //   return (
// //     <div>
// //       {loading ? (
// //         <Loading />
// //       ) : (
// //         <div className="container mx-auto px-4">
// //           <div className="container mx-auto px-4">
// //             <div className="flex justify-between items-center my-5">
// //               <h1 className="text-3xl font-bold">Latest Blogs</h1>
// //               <Button
// //                 onClick={toggleSidebar}
// //                 className="flex items-center gap-2 px-4 bg-primary text-white"
// //               >
// //                 <Filter size={18} />
// //                 <span>Filters</span>
// //               </Button>
// //             </div>
// //           </div>
// //           {blogLoading ? (
// //             <Loading />
// //           ) : (
// //             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
// //               {blogs?.length === 0 && <p>No Blogs yet</p>}
// //               {blogs &&
// //                 blogs.map((e, i) => {
// //                   return (
// //                     <BlogCard
// //                       key={i}
// //                       image={e.image}
// //                       title={e.title}
// //                       desc={e.description}
// //                       id={e.id}
// //                       time={e.created_at}
// //                     />
// //                   );
// //                 })}
// //             </div>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default Blogs;
// "use client";

// import BlogCard from "@/components/BlogCard";
// import Loading from "@/components/loading";
// import { Button } from "@/components/ui/button";
// import { useSidebar } from "@/components/ui/sidebar";
// import { useAppData } from "@/context/AppContext";
// import { Filter } from "lucide-react";
// import React from "react";

// const Blogs = () => {
//   const { toggleSidebar } = useSidebar();
//   const { loading, blogLoading, blogs } = useAppData();

//   if (loading) return <Loading />;

//   return (
//     <section className="space-y-6">
//       <div className="flex items-center justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-semibold tracking-tight">
//             Latest Blogs
//           </h1>
//           <p className="mt-1 text-sm text-muted-foreground">
//             Discover fresh reads curated for you.
//           </p>
//         </div>

//         <Button
//           onClick={toggleSidebar}
//           size="sm"
//           variant="outline"
//           className="inline-flex items-center gap-2 rounded-full border-border/70 bg-background/80 px-4 shadow-sm hover:border-primary/50"
//         >
//           <Filter size={16} />
//           <span className="hidden sm:inline">Filters</span>
//         </Button>
//       </div>

//       {blogLoading ? (
//         <Loading />
//       ) : blogs && blogs.length > 0 ? (
//         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//           {blogs.map((e) => (
//             <BlogCard
//               key={e.id}
//               image={e.image}
//               title={e.title}
//               desc={e.description}
//               id={e.id}
//               time={e.created_at}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="flex min-h-[40vh] items-center justify-center">
//           <p className="text-sm text-muted-foreground">
//             No blogs yet. Start by creating your first post.
//           </p>
//         </div>
//       )}
//     </section>
//   );
// };

// export default Blogs;

"use client";

import BlogCard from "@/components/BlogCard";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppData } from "@/context/AppContext";
import { Filter } from "lucide-react";
import React from "react";

const Blogs = () => {
  const { toggleSidebar } = useSidebar();
  const { loading, blogLoading, blogs } = useAppData();

  if (loading) return <Loading />;

  return (
    <section className="space-y-4 md:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Latest Blogs
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Discover fresh reads curated for you.
          </p>
        </div>

        <Button
          onClick={toggleSidebar}
          size="sm"
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full border-red-900/50 bg-[#050509]/80 px-4 text-slate-100 shadow-sm hover:border-red-500 hover:bg-red-500/10 hover:text-red-200"
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>

      {blogLoading ? (
        <Loading />
      ) : blogs && blogs.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {blogs.map((e) => (
            <BlogCard
              key={e.id}
              image={e.image}
              title={e.title}
              desc={e.description}
              id={e.id}
              time={e.created_at}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-slate-400">
            No blogs yet. Start by creating your first post.
          </p>
        </div>
      )}
    </section>
  );
};

export default Blogs;
