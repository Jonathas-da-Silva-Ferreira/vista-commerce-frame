import { useLocation } from "react-router-dom";
import { useEffect } from "react";

// 404 page — kept intentionally tiny. Logging the missed path helps catch
// dead links from external sources during operations.
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-2 text-xl text-muted-foreground">Page not found</p>
        <p className="mb-4 text-sm text-muted-foreground">The page you requested does not exist.</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Go back home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
