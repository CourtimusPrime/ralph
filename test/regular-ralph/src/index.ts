import { serve } from "bun";
import index from "./index.html";
import "./db";
import { categoryRoutes } from "./api/categories";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    ...categoryRoutes,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
