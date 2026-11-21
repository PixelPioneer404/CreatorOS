import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/useWorkspaceStore.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { ResearchService } from '../../services/research.service.js';
import { HookService } from '../../services/hook.service.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Select } from '../../components/ui/select.jsx';
import { Spinner } from '../../components/ui/loading-indicator.jsx';
import { AlertBanner } from '../../components/ui/alert-banner.jsx';
import { EmptyState } from '../../components/ui/empty-state.jsx';
import {
  Search,
  Sparkles,
  TrendingUp,
  Bookmark,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Flame,
  ArrowRight,
  Zap,
  Compass,
  Video,
  Share2,
  HelpCircle,
  RefreshCw,
  ChevronDown,
  Layers,
} from 'lucide-react';

const NICHE_QUICK_TAGS = {
  fitness: ['#GymRealism', '#FormCheck', '#HighProtein', '#JointHealth', '#HybridAthlete', '#QuickMeals'],
  tech: ['#LocalAI', '#OpenSource', '#AICoding', '#DeskSetup', '#DevTools', '#NoCode'],
  business: ['#PricingAudit', '#DigitalProducts', '#SoloFounder', '#SideHustle', '#AgencyGrowth'],
  productivity: ['#DopamineDetox', '#DeepWork', '#MinimalistSetup', '#MorningRoutine', '#SecondBrain'],
  general: ['#CreatorHacks', '#HookFirst', '#BehindTheScenes', '#ViralFormat', '#Productivity'],
};

export function ResearchLab() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaceStore();
  const { creatorProfile } = useAuthStore();

  const activeNiche = creatorProfile?.primaryNiche || 'Fitness';
  const activePlatform = creatorProfile?.primaryPlatform || 'Instagram Reels';

  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'ai_deep_dive' | 'trends' | 'hooks' | 'sources'
  const [loading, setLoading] = useState(false);
  const [radarLoading, setRadarLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Live Trend Radar State
  const [radarTrends, setRadarTrends] = useState([]);
  const [radarFilterPlatform, setRadarFilterPlatform] = useState('all');

  // AI Deep Dive State
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState(activeNiche);
  const [targetAudience, setTargetAudience] = useState(creatorProfile?.targetAudience || 'General audience');
  const [platform, setPlatform] = useState('instagram');
  const [researchResult, setResearchResult] = useState(null);

  // Tracked Trends State
  const [trends, setTrends] = useState([]);
  const [trendStatusFilter, setTrendStatusFilter] = useState('all');
  const [trendSearch, setTrendSearch] = useState('');
  const [isManualTrendModalOpen, setIsManualTrendModalOpen] = useState(false);
  const [manualTrendData, setManualTrendData] = useState({
    title: '',
    description: '',
    niche: activeNiche,
    status: 'emerging',
    opportunityScore: 85,
  });

  // Hooks State
  const [hooks, setHooks] = useState([]);
  const [hookCategoryFilter, setHookCategoryFilter] = useState('all');
  const [hookSearch, setHookSearch] = useState('');
  const [copiedHookId, setCopiedHookId] = useState(null);
  const [isManualHookModalOpen, setIsManualHookModalOpen] = useState(false);
  const [manualHookData, setManualHookData] = useState({
    text: '',
    category: 'curiosity',
    niche: activeNiche,
    performanceNotes: '',
  });

  // Sources State
  const [sources, setSources] = useState([]);
  const [isManualSourceModalOpen, setIsManualSourceModalOpen] = useState(false);
  const [manualSourceData, setManualSourceData] = useState({
    title: '',
    sourceType: 'article',
    url: '',
    description: '',
  });

  useEffect(() => {
    if (creatorProfile?.primaryNiche) {
      setNiche(creatorProfile.primaryNiche);
      setManualTrendData((prev) => ({ ...prev, niche: creatorProfile.primaryNiche }));
      setManualHookData((prev) => ({ ...prev, niche: creatorProfile.primaryNiche }));
    }
    if (creatorProfile?.targetAudience) {
      setTargetAudience(creatorProfile.targetAudience);
    }
  }, [creatorProfile]);

  useEffect(() => {
    if (!currentWorkspace?.id) return;
    loadRadar();
    loadTrends();
    loadHooks();
    loadSources();
  }, [currentWorkspace?.id, trendStatusFilter, trendSearch, hookCategoryFilter, hookSearch, radarFilterPlatform]);

  const loadRadar = async () => {
    try {
      setRadarLoading(true);
      const data = await ResearchService.getTrendingRadar(currentWorkspace.id, {
        niche: activeNiche,
        platform: radarFilterPlatform,
      });
      setRadarTrends(data || []);
    } catch (err) {
      console.error('Failed to load radar trends:', err);
    } finally {
      setRadarLoading(false);
    }
  };

  const loadTrends = async () => {
    try {
      const data = await ResearchService.listTrends(currentWorkspace.id, {
        status: trendStatusFilter,
        search: trendSearch,
      });
      setTrends(data || []);
    } catch (err) {
      console.error('Failed to load trends:', err);
    }
  };

  const loadHooks = async () => {
    try {
      const data = await HookService.listHooks(currentWorkspace.id, {
        category: hookCategoryFilter,
        search: hookSearch,
      });
      setHooks(data || []);
    } catch (err) {
      console.error('Failed to load hooks:', err);
    }
  };

  const loadSources = async () => {
    try {
      const data = await ResearchService.listSources(currentWorkspace.id);
      setSources(data || []);
    } catch (err) {
      console.error('Failed to load sources:', err);
    }
  };

  // 1-Click Auto Scan for creator's niche
  const handleAutoScanNiche = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setActiveTab('ai_deep_dive');

    const scanTopic = `Current breakout reel topics and viral formats in ${activeNiche}`;
    setTopic(scanTopic);

    try {
      const result = await ResearchService.startResearch(currentWorkspace.id, {
        topic: scanTopic,
        niche: activeNiche,
        targetAudience: targetAudience || 'Active social media audience',
        platform: 'instagram',
      });

      setResearchResult(result);
      setSuccessMessage(`AI Trend Radar scan completed for ${activeNiche}!`);
      loadTrends();
      loadSources();
    } catch (err) {
      setError(err.message || 'AI Trend scan timed out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCustomResearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const queryTopic = topic.trim() || `Breakout trends in ${niche || activeNiche}`;

    try {
      const result = await ResearchService.startResearch(currentWorkspace.id, {
        topic: queryTopic,
        niche: niche || activeNiche,
        targetAudience: targetAudience || 'Viewers seeking actionable content',
        platform,
      });

      setResearchResult(result);
      setSuccessMessage('Trend discovery analysis completed!');
      loadTrends();
      loadSources();
    } catch (err) {
      setError(err.message || 'AI trend analysis encountered an issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRadarToTracked = async (item) => {
    try {
      await ResearchService.createTrend(currentWorkspace.id, {
        title: item.title,
        description: `${item.whyItWorks} Angle: ${item.angle}`,
        niche: activeNiche,
        status: 'emerging',
        opportunityScore: item.opportunityScore || 90,
        evidence: [{ platform: item.platform, hook: item.sampleHook, momentum: item.momentum }],
      });
      loadTrends();
      setSuccessMessage(`Saved "${item.title}" to Tracked Trends!`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateManualTrend = async (e) => {
    e.preventDefault();
    try {
      await ResearchService.createTrend(currentWorkspace.id, {
        ...manualTrendData,
        opportunityScore: Number(manualTrendData.opportunityScore) || 80,
      });
      setIsManualTrendModalOpen(false);
      setManualTrendData({ title: '', description: '', niche: activeNiche, status: 'emerging', opportunityScore: 85 });
      loadTrends();
      setSuccessMessage('Trend observation tracked!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTrendStatus = async (trendId, status) => {
    try {
      await ResearchService.updateTrend(currentWorkspace.id, trendId, { status });
      loadTrends();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTrend = async (trendId) => {
    if (!confirm('Remove this trend observation?')) return;
    try {
      await ResearchService.deleteTrend(currentWorkspace.id, trendId);
      loadTrends();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateManualHook = async (e) => {
    e.preventDefault();
    try {
      await HookService.createHook(currentWorkspace.id, manualHookData);
      setIsManualHookModalOpen(false);
      setManualHookData({ text: '', category: 'curiosity', niche: activeNiche, performanceNotes: '' });
      loadHooks();
      setSuccessMessage('Custom hook added to your intelligence library!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHook = async (hookId) => {
    if (!confirm('Delete this hook?')) return;
    try {
      await HookService.deleteHook(currentWorkspace.id, hookId);
      loadHooks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopyHook = (hook) => {
    navigator.clipboard.writeText(hook.text);
    setCopiedHookId(hook.id);
    setTimeout(() => setCopiedHookId(null), 2000);
  };

  const handleCreateSource = async (e) => {
    e.preventDefault();
    try {
      await ResearchService.createSource(currentWorkspace.id, manualSourceData);
      setIsManualSourceModalOpen(false);
      setManualSourceData({ title: '', sourceType: 'article', url: '', description: '' });
      loadSources();
      setSuccessMessage('Research source captured!');
    } catch (err) {
      setError(err.message);
    }
  };

  const getQuickTags = () => {
    const key = (activeNiche || '').toLowerCase();
    if (key.includes('fit') || key.includes('gym')) return NICHE_QUICK_TAGS.fitness;
    if (key.includes('tech') || key.includes('ai') || key.includes('code')) return NICHE_QUICK_TAGS.tech;
    if (key.includes('biz') || key.includes('finance')) return NICHE_QUICK_TAGS.business;
    if (key.includes('prod') || key.includes('life')) return NICHE_QUICK_TAGS.productivity;
    return NICHE_QUICK_TAGS.general;
  };

  const getPlatformBadge = (platformName) => {
    if (platformName.toLowerCase().includes('tiktok')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/30">
          <Video className="h-3 w-3" /> TikTok Trend
        </span>
      );
    }
    if (platformName.toLowerCase().includes('instagram') || platformName.toLowerCase().includes('reel')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
          <Share2 className="h-3 w-3" /> Instagram Reel
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
        <Video className="h-3 w-3" /> YouTube Shorts
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research Lab"
        description="Discover viral reel trends, breakout creator formats, and high-retention hook intelligence."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsManualSourceModalOpen(true)}>
              <Bookmark className="h-4 w-4 mr-1.5" />
              Save Source
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsManualTrendModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Trend
            </Button>
          </div>
        }
      />

      {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}
      {successMessage && <AlertBanner type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}

      {/* Proactive Creator Niche Banner */}
      <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-purple-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Your Intelligence Feed
            </span>
            <span className="text-xs text-zinc-400">Tailored to your creative profile</span>
          </div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span>Niche:</span>
            <span className="text-indigo-400 underline decoration-indigo-500/40">{activeNiche}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-normal">Primary Platform: {activePlatform}</span>
          </h2>
          <p className="text-xs text-zinc-400">
            No need to invent topics from scratch. We analyze real breakout signals on TikTok, Reels, and Shorts for you.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleAutoScanNiche}
          disabled={loading}
          className="shrink-0 gap-2 shadow-lg shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
        >
          {loading ? (
            <>
              <Spinner className="h-4 w-4" />
              Scanning Breakout Trends...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-amber-300" />
              1-Click Scan Breakout Trends
            </>
          )}
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'radar'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Flame className="h-4 w-4 text-amber-400" />
          Live Trend Radar ({radarTrends.length})
        </button>
        <button
          onClick={() => setActiveTab('ai_deep_dive')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'ai_deep_dive'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="h-4 w-4 text-indigo-400" />
          AI Synthesis & Deep-Dive
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'trends'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Tracked Trends ({trends.length})
        </button>
        <button
          onClick={() => setActiveTab('hooks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'hooks'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bookmark className="h-4 w-4 text-emerald-400" />
          Hook Intelligence ({hooks.length})
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'sources'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Compass className="h-4 w-4 text-blue-400" />
          Reference Sources ({sources.length})
        </button>
      </div>

      {/* 1. LIVE TREND RADAR TAB */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400" />
                Trending Creator Formats in {activeNiche}
              </h3>
              <p className="text-xs text-zinc-400">
                Identified from viral TikToks, Instagram Reels, and YouTube Shorts. Pick any to build a video idea.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={radarFilterPlatform}
                onChange={(e) => setRadarFilterPlatform(e.target.value)}
                className="text-xs py-1 h-8 w-40"
              >
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram Reels</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube Shorts</option>
              </Select>
            </div>
          </div>

          {/* Quick Inspiration Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-zinc-500">Trending Hashtags:</span>
            {getQuickTags().map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setTopic(tag.replace('#', ''));
                  setActiveTab('ai_deep_dive');
                }}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Radar Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {radarTrends.map((item) => (
              <Card
                key={item.id}
                className="border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900/80 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    {getPlatformBadge(item.platform)}
                    <Badge variant="success" className="text-[10px] font-mono">
                      {item.momentum}
                    </Badge>
                  </div>

                  <CardTitle className="text-base text-zinc-100 mt-2 font-bold leading-snug">
                    {item.title}
                  </CardTitle>
                  <span className="text-[11px] text-zinc-400 font-medium">Category: {item.category}</span>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {/* Why it works */}
                  <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                      Why Viewers Watch:
                    </span>
                    <p className="text-zinc-300">{item.whyItWorks}</p>

                    <div className="pt-1.5 border-t border-zinc-900">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                        Suggested Visual Format:
                      </span>
                      <p className="text-zinc-300 font-medium">{item.angle}</p>
                    </div>

                    {item.sampleHook && (
                      <div className="pt-1.5 border-t border-zinc-900">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                          Hook to Say in First 3 Seconds:
                        </span>
                        <p className="text-zinc-200 italic font-medium">"{item.sampleHook}"</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveRadarToTracked(item)}
                      className="text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      <Bookmark className="h-3.5 w-3.5 mr-1" />
                      Save Trend
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        navigate('/ideas', {
                          state: {
                            prefillTrend: {
                              title: item.title,
                              description: item.whyItWorks,
                              niche: activeNiche,
                              hooks: [item.sampleHook],
                              opportunityScore: item.opportunityScore,
                            },
                          },
                        });
                      }}
                      className="text-xs gap-1.5 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-300" />
                      Build Reel Concept
                      <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 2. AI SYNTHESIS & DEEP-DIVE TAB */}
      {activeTab === 'ai_deep_dive' && (
        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Custom AI Trend Synthesis
              </CardTitle>
              <CardDescription>
                Ask Gemini to deep-dive into any specific topic, audience segment, or emerging format.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartCustomResearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-300">
                      Topic or Creator Question *
                    </label>
                    <Input
                      placeholder={`e.g. 5 viral reel formats for ${activeNiche}, or quiet workouts for small apartments`}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Target Audience</label>
                    <Input
                      placeholder="e.g. Gym beginners, intermediate lifters, busy parents"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Target Platform</label>
                    <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                      <option value="instagram">Instagram Reels</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube_shorts">YouTube Shorts</option>
                      <option value="youtube_long">YouTube Long-Form</option>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" variant="primary" disabled={loading} className="gap-2">
                    {loading ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Analyzing with Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Run Deep-Dive Synthesis
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Synthesis Results */}
          {researchResult && (
            <div className="space-y-6">
              <Card className="border-indigo-500/30 bg-indigo-950/20">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">
                    Executive Discovery Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-zinc-200 leading-relaxed">{researchResult.summary}</p>

                  {researchResult.contentGaps?.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-zinc-400 block mb-2">
                        Unaddressed Content Gaps in {activeNiche}:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {researchResult.contentGaps.map((gap, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs bg-zinc-900/80 border-indigo-500/20 text-zinc-300"
                          >
                            💡 {gap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Identified Trends */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Identified Trends ({researchResult.trends?.length || 0})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {researchResult.trends?.map((t, idx) => (
                    <Card key={idx} className="border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base text-zinc-100 font-bold leading-snug">
                            {t.title}
                          </CardTitle>
                          <Badge variant="primary" className="text-xs capitalize">
                            {t.status || 'Emerging'}
                          </Badge>
                        </div>
                        {t.description && (
                          <CardDescription className="text-xs mt-1.5 text-zinc-300">
                            {t.description}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-3 pt-0">
                        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-center">
                          <div>
                            <span className="text-[10px] uppercase text-zinc-500 block">Opportunity</span>
                            <span className="text-sm font-bold text-emerald-400">{t.opportunityScore || 85}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-zinc-500 block">Relevance</span>
                            <span className="text-sm font-bold text-indigo-400">{t.relevanceScore || 80}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-zinc-500 block">Saturation</span>
                            <span className="text-sm font-bold text-amber-400">{t.saturationEstimate || 35}%</span>
                          </div>
                        </div>

                        {t.angles?.length > 0 && (
                          <div className="text-xs space-y-1 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/60">
                            <span className="text-indigo-400 font-semibold block">Suggested Angle:</span>
                            <p className="text-zinc-200 italic">"{t.angles[0]}"</p>
                          </div>
                        )}

                        {t.hooks?.length > 0 && (
                          <div className="text-xs space-y-1 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/60">
                            <span className="text-emerald-400 font-semibold block">Recommended Hook:</span>
                            <p className="text-zinc-200 italic font-medium">"{t.hooks[0]}"</p>
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              navigate('/ideas', { state: { prefillTrend: t } });
                            }}
                            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                          >
                            <Zap className="h-3.5 w-3.5 text-amber-300" />
                            Turn into Idea in Studio
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TRACKED TRENDS TAB */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-1.5">
              {['all', 'emerging', 'rising', 'established', 'declining', 'saturated'].map((status) => (
                <button
                  key={status}
                  onClick={() => setTrendStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    trendStatusFilter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64">
              <Input
                placeholder="Search trends..."
                value={trendSearch}
                onChange={(e) => setTrendSearch(e.target.value)}
              />
            </div>
          </div>

          {trends.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No tracked trends yet"
              description="Save high-potential trends from the Live Trend Radar or log your own observations."
              actionLabel="Add Trend"
              onAction={() => setIsManualTrendModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trends.map((t) => (
                <Card key={t.id} className="border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base text-zinc-100 font-bold">{t.title}</CardTitle>
                        {t.niche && <span className="text-xs text-indigo-400 mt-0.5 block">{t.niche}</span>}
                      </div>
                      <Select
                        value={t.status}
                        onChange={(e) => handleUpdateTrendStatus(t.id, e.target.value)}
                        className="text-xs py-1 h-7 w-28"
                      >
                        <option value="emerging">Emerging</option>
                        <option value="rising">Rising</option>
                        <option value="established">Established</option>
                        <option value="declining">Declining</option>
                        <option value="saturated">Saturated</option>
                      </Select>
                    </div>
                    {t.description && (
                      <CardDescription className="text-xs mt-2 line-clamp-2">{t.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/60 pt-3">
                      <div>
                        Opportunity Score: <span className="font-bold text-emerald-400">{t.opportunityScore || '75'}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate('/ideas', { state: { prefillTrend: t } })}
                          className="h-7 text-xs text-indigo-400 hover:text-indigo-300 gap-1"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          Ideate
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTrend(t.id)}
                          className="h-7 text-xs text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. HOOK INTELLIGENCE TAB */}
      {activeTab === 'hooks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'curiosity', label: 'Curiosity' },
                { id: 'contradiction', label: 'Contradiction' },
                { id: 'relatability', label: 'Relatability' },
                { id: 'storytelling', label: 'Storytelling' },
                { id: 'problem_identification', label: 'Problem' },
                { id: 'authority', label: 'Authority' },
                { id: 'unexpected_revelation', label: 'Revelation' },
                { id: 'question_based', label: 'Question' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setHookCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    hookCategoryFilter === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search hooks..."
                value={hookSearch}
                onChange={(e) => setHookSearch(e.target.value)}
                className="w-full sm:w-56"
              />
              <Button size="sm" variant="primary" onClick={() => setIsManualHookModalOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hooks.map((h) => (
              <Card key={h.id} className="border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="primary" className="text-[10px] uppercase font-mono tracking-wider">
                      {h.category?.replace('_', ' ')}
                    </Badge>
                    <button
                      onClick={() => handleCopyHook(h)}
                      className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1 text-xs py-1 px-2 rounded bg-zinc-800/80 transition-colors"
                      title="Copy hook to clipboard"
                    >
                      {copiedHookId === h.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-zinc-100 mt-2 leading-relaxed">
                    "{h.text}"
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  {h.performanceNotes && (
                    <p className="text-xs text-zinc-400 bg-zinc-950/60 border border-zinc-800/60 p-2 rounded-lg">
                      💡 {h.performanceNotes}
                    </p>
                  )}
                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteHook(h.id)}
                      className="h-6 text-[11px] text-zinc-600 hover:text-red-400 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. SOURCES TAB */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-zinc-300">Reference Sources & Competitor Intel</h3>
            <Button size="sm" variant="outline" onClick={() => setIsManualSourceModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Source
            </Button>
          </div>

          {sources.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No reference sources logged"
              description="Save competitor videos, articles, and research sources to enrich your content ideation."
              actionLabel="Capture Source"
              onAction={() => setIsManualSourceModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {sources.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-zinc-100">{s.title}</h4>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {s.sourceType}
                      </Badge>
                    </div>
                    {s.description && <p className="text-xs text-zinc-400">{s.description}</p>}
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {s.url}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual Trend Modal */}
      {isManualTrendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-100">Add Trend Observation</h3>
            <form onSubmit={handleCreateManualTrend} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Trend Title *</label>
                <Input
                  required
                  placeholder="e.g. Split-screen gym form fix breakdown"
                  value={manualTrendData.title}
                  onChange={(e) => setManualTrendData({ ...manualTrendData, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Description</label>
                <Textarea
                  rows={3}
                  placeholder="Explain why this trend is working..."
                  value={manualTrendData.description}
                  onChange={(e) => setManualTrendData({ ...manualTrendData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Lifecycle Status</label>
                  <Select
                    value={manualTrendData.status}
                    onChange={(e) => setManualTrendData({ ...manualTrendData, status: e.target.value })}
                  >
                    <option value="emerging">Emerging</option>
                    <option value="rising">Rising</option>
                    <option value="established">Established</option>
                    <option value="declining">Declining</option>
                    <option value="saturated">Saturated</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Opportunity Score (0-100)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={manualTrendData.opportunityScore}
                    onChange={(e) => setManualTrendData({ ...manualTrendData, opportunityScore: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsManualTrendModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Trend
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Hook Modal */}
      {isManualHookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-100">Add Custom Hook Template</h3>
            <form onSubmit={handleCreateManualHook} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Hook Text *</label>
                <Textarea
                  required
                  rows={3}
                  placeholder="e.g. Stop doing [exercise] if you want to avoid [injury]."
                  value={manualHookData.text}
                  onChange={(e) => setManualHookData({ ...manualHookData, text: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Category</label>
                  <Select
                    value={manualHookData.category}
                    onChange={(e) => setManualHookData({ ...manualHookData, category: e.target.value })}
                  >
                    <option value="curiosity">Curiosity</option>
                    <option value="contradiction">Contradiction</option>
                    <option value="relatability">Relatability</option>
                    <option value="storytelling">Storytelling</option>
                    <option value="problem_identification">Problem</option>
                    <option value="authority">Authority</option>
                    <option value="unexpected_revelation">Revelation</option>
                    <option value="question_based">Question</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Niche (Optional)</label>
                  <Input
                    placeholder="e.g. Fitness"
                    value={manualHookData.niche}
                    onChange={(e) => setManualHookData({ ...manualHookData, niche: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Performance Notes</label>
                <Input
                  placeholder="e.g. High save rate for tutorial reels"
                  value={manualHookData.performanceNotes}
                  onChange={(e) => setManualHookData({ ...manualHookData, performanceNotes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsManualHookModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Hook
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Source Modal */}
      {isManualSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-100">Capture Reference Source</h3>
            <form onSubmit={handleCreateSource} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Title *</label>
                <Input
                  required
                  placeholder="e.g. Viral 1M+ view breakdown on high protein prep"
                  value={manualSourceData.title}
                  onChange={(e) => setManualSourceData({ ...manualSourceData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Source Type</label>
                  <Select
                    value={manualSourceData.sourceType}
                    onChange={(e) => setManualSourceData({ ...manualSourceData, sourceType: e.target.value })}
                  >
                    <option value="article">Article / Blog</option>
                    <option value="video">Video Reference</option>
                    <option value="competitor_analysis">Competitor</option>
                    <option value="social_post">Social Post</option>
                    <option value="academic">Report / Study</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">URL (Optional)</label>
                  <Input
                    placeholder="https://..."
                    value={manualSourceData.url}
                    onChange={(e) => setManualSourceData({ ...manualSourceData, url: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Notes / Insights</label>
                <Textarea
                  rows={3}
                  placeholder="What key learnings can you extract from this source?"
                  value={manualSourceData.description}
                  onChange={(e) => setManualSourceData({ ...manualSourceData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsManualSourceModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Source
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
