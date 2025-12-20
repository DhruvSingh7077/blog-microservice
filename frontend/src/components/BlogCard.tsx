// // import { Calendar } from "lucide-react";
// // import React from "react";
// // import { Card } from "./ui/card";
// // import moment from "moment";
// // import Link from "next/link";

// // interface BlogCardProps {
// //   image: string;
// //   title: string;
// //   desc: string;
// //   id: string;
// //   time: string;
// // }

// // const BlogCard: React.FC<BlogCardProps> = ({
// //   image,
// //   title,
// //   desc,
// //   id,
// //   time,
// // }) => {
// //   return (
// //     <Link href={`/blog/${id}`} className="group">
// //       <Card
// //         className="
// //     h-full overflow-hidden rounded-3xl
// //     border border-red-500/40
// //     bg-[#101016]   /* dark neutral */
// //     shadow-[0_18px_45px_rgba(0,0,0,0.7)]
// //     transition-transform transition-shadow duration-300
// //     group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_60px_rgba(0,0,0,0.9)]
// //   "
// //       >
// //         <div className="relative h-[210px] w-full overflow-hidden">
// //           <img
// //             src={image}
// //             alt={title}
// //             className="h-full w-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-105"
// //           />
// //           <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
// //         </div>

// //         <div className="flex flex-col gap-2 px-4 pb-4 pt-3 text-slate-50">
// //           <p className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-300">
// //             <Calendar size={14} className="text-red-400" />
// //             <span>{moment(time).format("MMM DD, YYYY")}</span>
// //           </p>

// //           <h2 className="text-center text-base font-semibold tracking-tight line-clamp-2">
// //             {title}
// //           </h2>

// //           <p className="text-center text-xs text-slate-300/90 line-clamp-3">
// //             {desc}
// //           </p>
// //         </div>
// //       </Card>
// //     </Link>
// //   );
// // };

// // export default BlogCard;
// import { Calendar } from "lucide-react";
// import React from "react";
// import { Card } from "./ui/card";
// import moment from "moment";
// import Link from "next/link";

// interface BlogCardProps {
//   image: string;
//   title: string;
//   desc: string;
//   id: string;
//   time: string;
// }

// const BlogCard: React.FC<BlogCardProps> = ({
//   image,
//   title,
//   desc,
//   id,
//   time,
// }) => {
//   return (
//     <Link href={`/blog/${id}`} className="group">
//       <Card
//         className="
//     h-full overflow-hidden rounded-3xl
//     border border-red-500/45
//     bg-gradient-to-b from-[#1a1a26] via-[#11111a] to-[#0b0b12]
//     shadow-[0_18px_45px_rgba(0,0,0,0.7)]
//     transition-transform transition-shadow duration-300
//     group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_60px_rgba(0,0,0,0.9)]
//   "
//       >
//         <div className="relative h-[200px] w-full overflow-hidden">
//           <img
//             src={image}
//             alt={title}
//             className="h-full w-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-105"
//           />
//           <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
//         </div>
//         <div className="flex flex-col gap-1.5 px-4 pb-4 pt-3">
//           <p className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
//             <Calendar size={14} className="text-red-400" />
//             <span>{moment(time).format("MMM DD, YYYY")}</span>
//           </p>

//           <h2 className="text-center text-base font-semibold tracking-tight text-slate-50 line-clamp-2">
//             {title}
//           </h2>

//           <p className="text-center text-xs text-slate-300/90 line-clamp-3">
//             {desc}
//           </p>
//         </div>
//       </Card>
//     </Link>
//   );
// };

// export default BlogCard;
import { Calendar } from "lucide-react";
import React from "react";
import { Card } from "./ui/card";
import moment from "moment";
import Link from "next/link";

interface BlogCardProps {
  image: string;
  title: string;
  desc: string;
  id: string;
  time: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  desc,
  id,
  time,
}) => {
  return (
    <Link href={`/blog/${id}`} className="group">
      <Card
        className="
          h-full overflow-hidden rounded-3xl
          border border-red-500/45
          bg-gradient-to-b from-[#1a1a26] via-[#11111a] to-[#0b0b12]
          shadow-[0_18px_45px_rgba(0,0,0,0.7)]
          transition-transform transition-shadow duration-300
          group-hover:-translate-y-1.5 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.45)]
        "
      >
        <div className="relative h-[200px] w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>

        <div className="flex flex-col gap-1.5 px-4 pb-4 pt-3">
          <p className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
            <Calendar size={14} className="text-red-400" />
            <span>{moment(time).format("MMM DD, YYYY")}</span>
          </p>

          <h2 className="text-center text-base font-semibold tracking-tight text-slate-50 line-clamp-2">
            {title}
          </h2>

          <p className="text-center text-xs text-slate-300/90 line-clamp-3">
            {desc}
          </p>
        </div>
      </Card>
    </Link>
  );
};

export default BlogCard;
