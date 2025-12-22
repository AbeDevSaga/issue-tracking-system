import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs() {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4">
      <Link to="/" className="hover:text-primary transition-colors">
        Home
      </Link>

      {pathnames.map((value, index) => {
        const to = "/" + pathnames.slice(0, index + 1).join("/");
        const isLast = index === pathnames.length - 1;

        return (
          <span key={to} className="flex items-center">
            <ChevronRight className="mx-2 h-4 w-4" />

            {isLast ? (
              <span className="font-medium text-foreground capitalize">
                {value.replace(/-/g, " ")}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-primary transition-colors capitalize"
              >
                {value.replace(/-/g, " ")}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
