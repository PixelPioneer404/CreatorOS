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
  Filter,
  Lightbulb,
  Layers,
  ArrowRight,
  BarChart3,
  Flame,
  Activity,
} from 'lucide-react';

export function ResearchLab() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaceStore();
  const { creatorProfile } = useAuthStore();

  const [activeTab, setActiveTab] = useState('discovery'); // 'discovery' | 'trends' | 'hooks' | 'sources'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Discovery State
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState(creatorProfile?.primaryNiche || 'AI & Tech');
  const [targetAudience, setTargetAudience] = useState(creatorProfile?.targetAudience || '');
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
    niche: '',
    status: 'emerging',
    opportunityScore: 80,
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
    niche: '',
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
    if (creatorProfile?.primaryNiche && !topic) {
      setNiche(creatorProfile.primaryNiche);
    }
    if (creatorProfile?.targetAudience && !targetAudience) {
      setTargetAudience(creatorProfile.targetAudience);
    }
  }, [creatorProfile]);

  useEffect(() => {
    if (!currentWorkspace?.id) return;
    loadTrends();
    loadHooks();
    loadSources();
  }, [currentWorkspace?.id, trendStatusFilter, trendSearch, hookCategoryFilter, hookSearch]);

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

  const handleStartResearch = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a topic or theme to research.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await ResearchService.startResearch(currentWorkspace.id, {
        topic,
        niche: niche || 'General',
        targetAudience: targetAudience || 'Content Creators',
        platform,
      });

      setResearchResult(result);
      setSuccessMessage('Research synthesis completed successfully!');
      // Refresh trends and sources lists
      loadTrends();
      loadSources();
    } catch (err) {
      setError(err.message || 'Failed to complete research synthesis.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualTrend = async (e) => {
    e.preventDefault();
    try {
      await ResearchService.createTrend(currentWorkspace.id, {
        ...manualTrendData,
        opportunityScore: Number(manualTrendData.opportunityScore) || 75,
      });
      setIsManualTrendModalOpen(false);
      setManualTrendData({ title: '', description: '', niche: '', status: 'emerging', opportunityScore: 80 });
      loadTrends();
      setSuccessMessage('Trend observation saved!');
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
    if (!confirm('Are you sure you want to remove this trend observation?')) return;
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
      setManualHookData({ text: '', category: 'curiosity', niche: '', performanceNotes: '' });
      loadHooks();
      setSuccessMessage('Custom hook added to your intelligence library!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHook = async (hookId) => {
    if (!confirm('Are you sure you want to delete this hook?')) return;
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

  const getStatusBadge = (status) => {
    const map = {
      emerging: { variant: 'primary', label: 'Emerging' },
      rising: { variant: 'success', label: 'Rising' },
      established: { variant: 'default', label: 'Established' },
      declining: { variant: 'upcoming', label: 'Declining' },
      saturated: { variant: 'outline', label: 'Saturated' },
    };
    const s = map[status] || { variant: 'default', label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research Lab"
        description="Discover emerging creator trends, monitor content gaps, and search high-converting hooks."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsManualSourceModalOpen(true)}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Capture Source
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsManualTrendModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trend
            </Button>
          </div>
        }
      />

      {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}
      {successMessage && <AlertBanner type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800 gap-1">
        <button
          onClick={() => setActiveTab('discovery')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'discovery'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Trend Discovery
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'trends'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Tracked Trends ({trends.length})
        </button>
        <button
          onClick={() => setActiveTab('hooks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'hooks'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Flame className="h-4 w-4" />
          Hook Intelligence ({hooks.length})
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sources'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Sources ({sources.length})
        </button>
      </div>

      {/* 1. AI Trend Discovery Tab */}
      {activeTab === 'discovery' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Synthesize Niche Trends with Gemini
              </CardTitle>
              <CardDescription>
                Analyze real content opportunities, saturation levels, and viral video angles powered by Gemini 3.8 Flash.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartResearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-300">Research Focus Topic or Theme *</label>
                    <Input
                      placeholder="e.g. Local AI tools, 60-second video editing workflows, personal finance hacks"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Creator Niche</label>
                    <Input
                      placeholder="e.g. AI & Tech, Productivity, Fitness"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Target Audience</label>
                    <Input
                      placeholder="e.g. Freelancers, early-stage creators, software developers"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Primary Platform</label>
                    <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                      <option value="instagram">Instagram Reels</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube_shorts">YouTube Shorts</option>
                      <option value="youtube_long">YouTube Long-Form</option>
                      <option value="linkedin">LinkedIn</option>
                    </Select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" disabled={loading} className="gap-2">
                    {loading ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Analyzing Landscape...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Analyze Trends with Gemini
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Research Synthesis Results */}
          {researchResult && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <Card className="border-indigo-500/30 bg-indigo-950/20">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">
                    Discovery Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-zinc-200 leading-relaxed">{researchResult.summary}</p>
                  {researchResult.contentGaps?.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-zinc-400 block mb-2">Unaddressed Content Gaps:</span>
                      <div className="flex flex-wrap gap-2">
                        {researchResult.contentGaps.map((gap, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-zinc-900/80 border-indigo-500/20 text-zinc-300">
                            {gap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Identified Trends */}
              <div>
                <h3 className="text-base font-semibold text-zinc-100 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Identified Trends ({researchResult.trends?.length || 0})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {researchResult.trends?.map((t, idx) => (
                    <Card key={idx} className="border-zinc-800 hover:border-zinc-700 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base text-zinc-100 leading-snug">{t.title}</CardTitle>
                          {getStatusBadge(t.status)}
                        </div>
                        <CardDescription className="line-clamp-2 text-xs mt-1">{t.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        {/* Score breakdown bar */}
                        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-center">
                          <div>
                            <span className="text-[10px] uppercase text-zinc-500 block">Opportunity</span>
                            <span className="text-sm font-bold text-emerald-400">{t.opportunityScore}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-zinc-500 block">Relevance</span>
                            <span className="text-sm font-bold text-indigo-400">{t.relevanceScore}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-zinc-500 block">Saturation</span>
                            <span className="text-sm font-bold text-amber-400">{t.saturationEstimate}%</span>
                          </div>
                        </div>

                        {/* Hooks and angles */}
                        {t.angles?.length > 0 && (
                          <div className="text-xs space-y-1">
                            <span className="text-zinc-400 font-semibold">Suggested Angle:</span>
                            <p className="text-zinc-300 italic">"{t.angles[0]}"</p>
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigate('/ideas', { state: { prefillTrend: t } });
                            }}
                            className="text-xs gap-1.5"
                          >
                            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                            Build Idea from Trend
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

      {/* 2. Tracked Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            {/* Filter pills */}
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

            {/* Search */}
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
              description="Discover new trends using the AI Trend Discovery tab or log one manually."
              actionLabel="Add Trend"
              onAction={() => setIsManualTrendModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trends.map((t) => (
                <Card key={t.id} className="border-zinc-800/80 hover:border-zinc-700 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base text-zinc-100">{t.title}</CardTitle>
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
                          className="h-7 text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          <Lightbulb className="h-3.5 w-3.5 mr-1" />
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

      {/* 3. Hook Intelligence Tab */}
      {activeTab === 'hooks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            {/* Category Pills */}
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
                  <p className="text-sm font-medium text-zinc-100 mt-2 leading-relaxed">
                    {h.text}
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

      {/* 4. Sources Tab */}
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
                  placeholder="e.g. Split-screen gameplay with voice narration"
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
                  placeholder="e.g. Stop scrolling if you want to fix [problem] in 30 seconds."
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
                  placeholder="e.g. Drives high watch time on vertical short-form"
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
                  placeholder="e.g. Viral breakdown on Instagram Reels algorithm 2026"
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
