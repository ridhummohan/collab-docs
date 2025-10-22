// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Protect the app routes under /create, /doc, and the home page
export const config = {
  matcher: ["/", "/create", "/doc/:path*"],
};
