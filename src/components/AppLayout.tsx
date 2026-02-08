import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col pb-[var(--nav-height)]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
