import { MapPin, Stamp, Trophy, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

const BottomNav = () => {
  const { isAdmin } = useUserRole();

  const navItems = [
    { to: "/explorar", label: "Explorar", icon: MapPin },
    { to: "/pasaporte", label: "Mi Pasaporte", icon: Stamp },
    { to: "/ranking", label: "Ranking", icon: Trophy },
    // Admin item - conditionally added
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="flex h-[var(--nav-height)] items-center justify-around px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 text-muted-foreground",
                isActive && "text-primary"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200",
                    isActive && "bg-primary/10 scale-110"
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn("text-[11px] font-medium", isActive && "font-semibold")}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
