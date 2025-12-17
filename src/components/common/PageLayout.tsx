import { useLocation, useNavigate } from "react-router";
import { useGlobalSearch } from "../../context/GlobalSearchContext";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/cn/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/cn/select";
import { FilterPopover } from "./FilterDrawer";
import { Button } from "../ui/cn/button";

export const PageLayout: React.FC<PageLayoutProps & { className?: string }> = ({
  title,
  description,
  toggleActions = [],
  actions = [],
  filters = [],
  children,
  toggle = "table",
  showtoggle = false,
  onToggle = () => {},
  filterColumnsPerRow = 1,
  className = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { search, setSearch } = useGlobalSearch();

  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const value = params.get("search") || "";
    setSearch(value);
  }, [location.search, setSearch]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);

      const params = new URLSearchParams(location.search);
      value ? params.set("search", value) : params.delete("search");
      params.set("page", "1");

      navigate(`${location.pathname}?${params.toString()}`);
    },
    [location.pathname, location.search, navigate, setSearch]
  );

  return (
    <div className={`p-6 border rounded-lg bg-white shadow ${className}`}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            {/* Title */}
            {title && (
              <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
            )}
            {description && <p className="text-gray-500 mt-1">{description}</p>}

            {/* Toggle Actions */}
            {toggleActions.length > 0 && (
              <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-md border border-[#e5e7eb] shadow-sm">
                {toggleActions.map((action, index) => {
                  const isActive = action.variant === "default";
                  return (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={`
                        flex items-center gap-2 px-6 border border-[#e5e7eb] py-2 rounded-md text-sm font-medium
                        transition-all duration-300
                        ${
                          isActive
                            ? "bg-[#073954] text-white"
                            : "text-[#073954] bg-slate-100 hover:bg-slate-200"
                        }
                      `}
                    >
                      {action.loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        action.icon && (
                          <span className="h-4 w-4">{action.icon}</span>
                        )
                      )}
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right side: Search, Toggle, Filters, Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* View Toggle */}
            {showtoggle && (
              <Select value={toggle} onValueChange={(value) => onToggle(value)}>
                <SelectTrigger className="w-40 bg-white text-gray-700 border-gray-300 focus:ring-0">
                  <SelectValue placeholder="Table View" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem
                    value="table"
                    className="text-gray-700 hover:bg-gray-200"
                  >
                    Table View
                  </SelectItem>
                  <SelectItem
                    value="hierarchy"
                    className="text-gray-700 hover:bg-gray-200"
                  >
                    Hierarchy View
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Filters */}
            {filters.length > 0 && (
              <FilterPopover
                filters={filters}
                columnsPerRow={filterColumnsPerRow}
              />
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex items-center space-x-2 text-white">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    size={
                      ((action.size === "md" ? "default" : action.size) ||
                        "default") as "default" | "sm" | "lg" | "xs" | "icon"
                    }
                    onClick={action.onClick}
                    disabled={action.disabled || action.loading}
                    className="flex items-center space-x-2"
                  >
                    {action.loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      action.icon && (
                        <span className="h-4 w-4">{action.icon}</span>
                      )
                    )}
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white">{children}</div>
      </div>
    </div>
  );
};
