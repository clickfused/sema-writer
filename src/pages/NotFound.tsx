import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: "var(--gradient-subtle)" }}>
      <div className="text-center">
        <h1 className="mb-3 sm:mb-4 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-primary">404</h1>
        <p className="mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl text-muted-foreground">Oops! Page not found</p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 text-sm sm:text-base bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
