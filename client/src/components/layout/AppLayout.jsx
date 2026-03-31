import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useState } from 'react';
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
      </div>
    </div>
  );
}
