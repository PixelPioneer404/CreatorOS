import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, LogOut, User, Settings, Building2, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useWorkspaceStore } from '../../store/useWorkspaceStore.js';
import { Badge } from '../ui/badge.jsx';

export function Navbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { currentWorkspace, creatorProfile } = useWorkspaceStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/login');
  };

  const displayName = creatorProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Creator';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Workspace indicator */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-medium text-zinc-400">Workspace</span>
            <p className="text-sm font-semibold text-zinc-200 leading-none">
              {currentWorkspace?.name || 'Creator Studio'}
            </p>
          </div>
          <Badge variant="primary" className="ml-1 text-[11px] font-mono">
            {currentWorkspace?.role || 'owner'}
          </Badge>
        </div>
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1.5 pr-3 text-left hover:border-zinc-700 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs shadow-inner">
            {initial}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-zinc-200 leading-tight">{displayName}</p>
            <p className="text-[11px] text-zinc-500 leading-none truncate max-w-[140px]">{user?.email}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl z-40">
              <div className="px-4 py-2 border-b border-zinc-800/80">
                <p className="text-xs font-medium text-zinc-400">Signed in as</p>
                <p className="text-xs font-semibold text-zinc-200 truncate">{user?.email}</p>
              </div>

              <Link
                to="/settings/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              >
                <Settings className="h-4 w-4 text-zinc-400" />
                <span>Profile Settings</span>
              </Link>

              <div className="border-t border-zinc-800/80 my-1" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
