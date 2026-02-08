import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { Handshake, HomeIcon, Menu, X } from "lucide-react";
import Logo from "../login/component/logo";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const options = [
    { label: "Dashboard", icon: HomeIcon, to: "/dashboard" },
    { label: "Rooms", icon: Handshake, to: "/dashboard/rooms" },
  ];

  return (
    <div className="flex h-screen w-full min-h-[100dvh] overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        className={`fixed inset-0 z-30 bg-black/50 sm:hidden transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed sm:relative inset-y-0 left-0 z-40 h-full w-[15rem] md:w-[20rem] shrink-0 border-r border-calendar-ring flex flex-col bg-white dark:bg-gray-900 transition-transform duration-200 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        <div className="w-full h-auto px-4 flex items-center justify-between ">
          <Logo
            imgClassName="md:!w-25 md:!h-25 !w-20 !h-20"
            titleClassName="md:text-2xl text-lg"
          />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-2 sm:hidden rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Hide menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="p-2 flex flex-col gap-2">
          {options.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 p-3 rounded-md transition-colors ${
                  isActive
                    ? "!bg-calendar-ring !text-white hover:!bg-accent-blue "
                    : "hover:!bg-accent-blue !text-calendar-ring"
                }`
              }
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex flex-1 flex-col min-w-0 min-h-0 overflow-auto">
        <header className="flex justify-between items-center shrink-0 p-4 border-b border-calendar-ring">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 sm:hidden rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-week-first hover:text-calendar-ring underline ml-auto border !border-none"
          >
            Logout
          </button>
        </header>
        <div className="flex-1 p-4 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
