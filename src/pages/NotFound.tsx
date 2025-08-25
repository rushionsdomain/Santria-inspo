import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to another location.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-gradient-medical text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Return to Dashboard
          </a>
          <a 
            href="/patients" 
            className="inline-flex items-center px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
          >
            View Patients
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
