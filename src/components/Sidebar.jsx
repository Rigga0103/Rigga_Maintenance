import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  BarChart3,
  LogOut,
  User,
  Key,
  Menu,
  X,
} from "lucide-react";
import useAuthStore from "../store/authStore";

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const allMenuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/machines", icon: Wrench, label: "Machines" },
    { path: "/assign-task", icon: ClipboardList, label: "Assign Task" },
    { path: "/tasks", icon: ClipboardList, label: "Tasks" },
    { path: "/reports", icon: BarChart3, label: "Reports" },
    { path: "/license", icon: Key, label: "License" },
    { path: "/store-in", icon: BarChart3, label: "Store In" },
  ];

  const allowedPages = user?.page
    ? user.page.split(",").map((page) => page.trim())
    : [];

  const filteredMenuItems = allMenuItems.filter((item) => {
    const pageAllowed =
      allowedPages.length === 0 || allowedPages.includes(item.label);
    const roleAllowed =
      !item.requiredRole || user?.role === item.requiredRole;
    return pageAllowed && roleAllowed;
  });

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full w-64 bg-indigo-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-indigo-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wrench size={24} />
          <span>MaintenancePro</span>
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-indigo-200 hover:text-white"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center py-2.5 px-4 rounded-lg transition-colors ${
                isActive
                  ? "bg-indigo-800 text-white"
                  : "text-indigo-100 hover:bg-indigo-800 hover:text-white"
              }`
            }
          >
            <item.icon className="mr-3" size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-indigo-800">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{user?.id || "Guest"}</p>
              <p className="text-xs">
                {user?.role === "admin"
                  ? "Administrator"
                  : "Maintenance Team"}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            handleLogout();
            onClose?.();
          }}
          className="flex items-center py-2.5 px-4 rounded-lg text-indigo-100 hover:bg-indigo-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="mr-3" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Menu button - visible on tablet and mobile (hidden on desktop) */}
      <button
        className="hidden md:block lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-900 text-white rounded-md shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} />
      </button>
      
      {/* Mobile menu button - visible only on mobile (hidden on tablet and desktop) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-900 text-white rounded-md shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Desktop Sidebar - always visible on desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64">
        <SidebarContent />
      </div>

      {/* Tablet Sidebar - only visible when isOpen is true */}
      <div className={`hidden md:block lg:hidden fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-64 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <SidebarContent onClose={() => setIsOpen(false)} />
        </div>
      </div>

      {/* Mobile Sidebar - only visible when isOpen is true */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-64 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <SidebarContent onClose={() => setIsOpen(false)} />
        </div>
      </div>

      {/* Add padding to main content when sidebar is open on desktop */}
      <div className="lg:pl-64"></div>
    </>
  );
};

export default Sidebar;