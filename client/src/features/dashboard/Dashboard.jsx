import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/useWorkspaceStore.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { CreatorService } from '../../services/creator.service.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Button } from '../../components/ui/button.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import { Spinner } from '../../components/ui/loading-indicator.jsx';
import {
  Sparkles,
  User,
  Settings,
  Search,
  Lightbulb,
  FileText,
  Calendar,
  BarChart2,
  Briefcase,
  Target,
  Layers,
  Globe2,
  ExternalLink,
} from 'lucide-react';

const upcomingRoadmap = [
  {
    version: 'V2',
    name: 'Research & Idea Engine',
    icon: Search,
    description: 'Niche trend discovery, multi-source reference capture, searchable hook library, and AI idea scoring.',
  },
  {
    version: 'V3',
    name: 'Script Studio',
    icon: FileText,
    description: 'Structured narrative architectures (PAS, AIDA, HPS), script builder, and section-by-section analysis.',
  },
  {
    version: 'V4',
    name: 'Planner & Publishing',
    icon: Calendar,
    description: 'Content calendar, drag-and-drop workflow statuses, caption generation, and publishing preparation.',
  },
  {
    version: 'V5 & V6',
    name: 'Instagram Integration & Analytics Lab',
    icon: BarChart2,
    description: 'Direct Meta Graph API synchronization, historical metric snapshots, and retention analytics.',
  },
  {
    version: 'V8 & V9',
    name: 'Brand CRM & Finance',
    icon: Briefcase,
    description: 'Sponsorship deal tracking, deliverable management, invoice tracking, and creator revenue overview.',
  },
];

export function Dashboard() {
  const { user } = useAuthStore();
  const { currentWorkspace, creatorProfile } = useWorkspaceStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!currentWorkspace?.id) return;
      try {
        setLoading(true);
        const data = await CreatorService.getDashboardSummary(currentWorkspace.id);
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentWorkspace?.id]);

  const profile = dashboardData?.creator || creatorProfile;
  const creatorName = profile?.displayName || user?.displayName || 'Creator';

  if (loading && !dashboardData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${creatorName}`}
        description="Here is your creator workspace overview, configuration summary, and upcoming system roadmap."
        actions={
          <Link to="/settings/profile">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          </Link>
        }
      />

      {/* Welcome & Identity Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950/60 shadow-lg">
          <CardHeader className="flex flex-row items-start justify-between pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{creatorName}</CardTitle>
                {profile?.username && (
                  <Badge variant="primary">@{profile.username}</Badge>
                )}
              </div>
              <CardDescription>
                Primary Platform: <span className="text-zinc-200 font-medium">{profile?.primaryPlatform || 'Not selected'}</span>
              </CardDescription>
            </div>
            <Badge variant={profile?.onboardingCompleted ? 'success' : 'upcoming'}>
              {profile?.onboardingCompleted ? 'Profile Active' : 'Setup Incomplete'}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            {profile?.bio ? (
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 rounded-lg p-3.5 border border-zinc-800/80">
                "{profile.bio}"
              </p>
            ) : (
              <p className="text-xs text-zinc-500 italic">No creator bio configured yet.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Primary Niche
                </span>
                <span className="text-sm font-medium text-zinc-200">
                  {profile?.primaryNiche || 'Not specified'}
                </span>
                {profile?.secondaryNiches?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {profile.secondaryNiches.map((niche) => (
                      <Badge key={niche} variant="outline" className="text-[10px]">
                        {niche}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Target Audience
                </span>
                <p className="text-xs text-zinc-300 line-clamp-3">
                  {profile?.targetAudience || 'No target audience configured.'}
                </p>
              </div>
            </div>

            {profile?.goals?.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Active Creator Goals
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.goals.map((g) => (
                    <Badge key={g} variant="primary" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workspace Quick Details */}
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader>
            <CardTitle className="text-base">Workspace Status</CardTitle>
            <CardDescription>Multi-tenant tenant container</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-zinc-400">Workspace Name</span>
              <p className="text-sm font-semibold text-zinc-200">{currentWorkspace?.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-zinc-400">Slug Identifier</span>
              <p className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                {currentWorkspace?.slug}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-zinc-400">Authorization Level</span>
              <p className="text-xs font-semibold text-emerald-400">Workspace Owner (Full Control)</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-zinc-400">Database Engine</span>
              <p className="text-xs text-zinc-300">Supabase PostgreSQL + Drizzle ORM</p>
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <Link to="/settings/profile" className="w-full">
                <Button variant="secondary" size="sm" className="w-full">
                  Manage Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Honest Empty States for Modules Scheduled in Upcoming Versions */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Content Workspace</h3>
          <p className="text-xs text-zinc-400">
            Real workspace assets and workflows. Displays genuine empty states until future modules are deployed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EmptyState
            icon={Lightbulb}
            title="No Content Ideas Yet"
            description="Idea Studio arrives in Version 2. You will be able to discover trends, curate hook frameworks, and generate AI-scored concepts."
          />
          <EmptyState
            icon={FileText}
            title="No Video Scripts"
            description="Script Studio arrives in Version 3. Reusable narrative architectures (PAS, AIDA) and section-level drafting will be available."
          />
          <EmptyState
            icon={Calendar}
            title="Content Calendar Clean"
            description="Content Planner arrives in Version 4. Manage publishing dates, pipeline status, and packaging details from one central board."
          />
        </div>
      </div>

      {/* Development Roadmap Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Upcoming Version Roadmap</h3>
          <p className="text-xs text-zinc-400">
            According to the Master Blueprint, features are built version by version.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingRoadmap.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.version} className="border-zinc-800/80 bg-zinc-900/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="upcoming" className="font-mono text-[10px]">
                      {item.version}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-semibold">{item.name}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed mt-1">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
