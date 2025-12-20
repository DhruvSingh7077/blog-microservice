// import React from "react";

// const Loading = () => {
//   return (
//     <div className="w-[200px] m-auto mt-[200px]">
//       <p className="text-2xl text-blue-500 font-bold text-center">Loading...</p>
//     </div>
//   );
// };

// export default Loading;
import React from "react";

const Loading = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground tracking-tight">
          Loading your content...
        </p>
      </div>
    </div>
  );
};

export default Loading;
