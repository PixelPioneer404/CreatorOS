import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Lightbulb,
  FileText,
  Calendar,
  Share2,
  BarChart3,
  Users2,
  Bot,
  Briefcase,
  DollarSign,
  FolderArchive,
  Palette,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { Badge } from '../ui/badge.jsx';
import { cn } from '../../lib/utils.js';

const navGroups = [
  {
    title: 'WORKSPACE',
    items: [
      { name: 'Overview', to: '/dashboard', icon: LayoutDashboard, active: true },
      { name: 'Research Lab', icon: Search, upcomingVersion: 'V2' },
      { name: 'Idea Studio', icon: Lightbulb, upcomingVersion: 'V2' },
      { name: 'Script Studio', icon: FileText, upcomingVersion: 'V3' },
      { name: 'Content Planner', icon: Calendar, upcomingVersion: 'V4' },
      { name: 'Publishing Hub', icon: Share2, upcomingVersion: 'V4' },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { name: 'Analytics Lab', icon: BarChart3, upcomingVersion: 'V6' },
      { name: 'Audience Intel', icon: Users2, upcomingVersion: 'V7' },
      { name: 'AI Assistant', icon: Bot, upcomingVersion: 'Future' },
    ],
  },
  {
    title: 'BUSINESS',
    items: [
      { name: 'Brand CRM', icon: Briefcase, upcomingVersion: 'V8' },
      { name: 'Finance Manager', icon: DollarSign, upcomingVersion: 'V9' },
      { name: 'Media Library', icon: FolderArchive, upcomingVersion: 'Future' },
    ],
  },
  {
    title: 'FUTURE',
    items: [
      { name: 'Portfolio Builder', icon: Palette, upcomingVersion: 'V11' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Profile Settings', to: '/settings/profile', icon: Settings, active: true },
    ],
  },
];

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">Creator OS</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 block -mt-1">V1 Foundation</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h4 className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  if (item.active && item.to) {
                    return (
                      <NavLink
                        key={item.name}
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/20'
                              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                          )
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  }

                  // Upcoming disabled module
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-600 cursor-not-allowed group select-none"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 text-zinc-700" />
                        <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
                          {item.name}
                        </span>
                      </div>
                      <Badge variant="upcoming" className="text-[10px] py-0 px-1.5 font-mono">
                        {item.upcomingVersion}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="border-t border-zinc-800/80 p-4">
          <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/80 p-3">
            <p className="text-xs font-semibold text-zinc-300">Phase 1 Architecture</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-normal">
              Foundational multi-tenant core running on Supabase & PostgreSQL.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
