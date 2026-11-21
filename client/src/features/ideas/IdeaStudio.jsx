import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/useWorkspaceStore.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { IdeaService } from '../../services/idea.service.js';
import { ResearchService } from '../../services/research.service.js';
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
  Lightbulb,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Flame,
  CheckCircle2,
  Filter,
  BarChart,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  Zap,
  ArrowRight,
  Video,
  Share2,
} from 'lucide-react';

const SMART_PROMPTS = [
  'Top 3 Common Mistakes Viewers Make & How to Fix Them',
  'Contrarian Truth: Why Popular Advice is Dead Wrong',
  'Step-by-Step 60-Second Tutorial for Beginners',
  'Before & After Reality: Expectation vs The Truth',
  'The Underrated Habit That Saves 10 Hours a Week',
];

export function IdeaStudio() {
  const location = useLocation();
  const { currentWorkspace } = useWorkspaceStore();
  const { creatorProfile } = useAuthStore();

  const activeNiche = creatorProfile?.primaryNiche || 'Fitness';
  const activeAudience = creatorProfile?.targetAudience || 'Engaged social media audience';

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Trending Radar Suggestions
  const [trendingInspirations, setTrendingInspirations] = useState([]);
  const [quickGenerating, setQuickGenerating] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Generation Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiNiche, setAiNiche] = useState(activeNiche);
  const [aiAudience, setAiAudience] = useState(activeAudience);
  const [aiFormat, setAiFormat] = useState('reel');
  const [aiCount, setAiCount] = useState(3);
  const [aiInstructions, setAiInstructions] = useState('');
  const [generatedBatch, setGeneratedBatch] = useState([]);

  // Manual / Edit Idea Modal
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState(null);
  const [ideaFormData, setIdeaFormData] = useState({
    title: '',
    concept: '',
    format: 'reel',
    niche: activeNiche,
    targetAudience: activeAudience,
    mainHook: '',
    alternativeHooks: ['', ''],
    audienceProblem: '',
    viewerValue: '',
    cta: '',
    priorityScore: 82,
    status: 'draft',
    trendId: null,
  });

  // Selected idea for explanation modal/popover
  const [scoreModalIdea, setScoreModalIdea] = useState(null);

  useEffect(() => {
    if (creatorProfile?.primaryNiche) {
      setAiNiche(creatorProfile.primaryNiche);
      setIdeaFormData((prev) => ({ ...prev, niche: creatorProfile.primaryNiche }));
    }
    if (creatorProfile?.targetAudience) {
      setAiAudience(creatorProfile.targetAudience);
      setIdeaFormData((prev) => ({ ...prev, targetAudience: creatorProfile.targetAudience }));
    }
  }, [creatorProfile]);

  useEffect(() => {
    if (location.state?.prefillTrend) {
      const trend = location.state.prefillTrend;
      setIdeaFormData({
        title: trend.title || 'Untitled Trend Reel',
        concept: trend.description || '',
        format: 'reel',
        niche: trend.niche || activeNiche,
        targetAudience: activeAudience,
        mainHook: trend.hooks?.[0] || '',
        alternativeHooks: trend.hooks?.slice(1) || ['', ''],
        audienceProblem: '',
        viewerValue: '',
        cta: '',
        priorityScore: Number(trend.opportunityScore) || 85,
        status: 'draft',
        trendId: trend.id || null,
      });
      setIsIdeaModalOpen(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (!currentWorkspace?.id) return;
    loadIdeas();
    loadTrendingInspirations();
  }, [currentWorkspace?.id, statusFilter, formatFilter, searchQuery]);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const data = await IdeaService.listIdeas(currentWorkspace.id, {
        status: statusFilter,
        format: formatFilter,
        search: searchQuery,
      });
      setIdeas(data || []);
    } catch (err) {
      console.error('Failed to load ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingInspirations = async () => {
    try {
      const data = await ResearchService.getTrendingRadar(currentWorkspace.id, {
        niche: activeNiche,
      });
      setTrendingInspirations(data?.slice(0, 3) || []);
    } catch (err) {
      console.error('Failed to load inspirations:', err);
    }
  };

  // 1-Click Proactive Idea Generation for the Creator's Niche
  const handleQuickSuggestForNiche = async () => {
    setQuickGenerating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await IdeaService.generateAiIdeas(currentWorkspace.id, {
        topic: `Current viral video formats and high-retention reel angles in ${activeNiche}`,
        niche: activeNiche,
        targetAudience: activeAudience,
        format: 'reel',
        count: 3,
        saveImmediately: true, // Automatically saves to their workspace!
      });

      setSuccessMessage(`✨ Generated and saved 3 new viral reel ideas tailored for ${activeNiche}!`);
      loadIdeas();
    } catch (err) {
      setError(err.message || 'Generation timed out. Please try again.');
    } finally {
      setQuickGenerating(false);
    }
  };

  const handleOpenNewModal = () => {
    setEditingIdeaId(null);
    setIdeaFormData({
      title: '',
      concept: '',
      format: 'reel',
      niche: activeNiche,
      targetAudience: activeAudience,
      mainHook: '',
      alternativeHooks: ['', ''],
      audienceProblem: '',
      viewerValue: '',
      cta: '',
      priorityScore: 82,
      status: 'draft',
      trendId: null,
    });
    setIsIdeaModalOpen(true);
  };

  const handleOpenEditModal = (idea) => {
    setEditingIdeaId(idea.id);
    setIdeaFormData({
      title: idea.title,
      concept: idea.concept,
      format: idea.format || 'reel',
      niche: idea.niche || activeNiche,
      targetAudience: idea.targetAudience || activeAudience,
      mainHook: idea.mainHook || '',
      alternativeHooks: idea.alternativeHooks || ['', ''],
      audienceProblem: idea.audienceProblem || '',
      viewerValue: idea.viewerValue || '',
      cta: idea.cta || '',
      priorityScore: Number(idea.priorityScore) || 75,
      status: idea.status || 'draft',
      trendId: null,
    });
    setIsIdeaModalOpen(true);
  };

  const handleSaveIdea = async (e) => {
    e.preventDefault();
    if (!ideaFormData.title.trim() || !ideaFormData.concept.trim()) {
      setError('Title and concept are required.');
      return;
    }

    try {
      const payload = {
        ...ideaFormData,
        priorityScore: Number(ideaFormData.priorityScore) || 75,
        alternativeHooks: (ideaFormData.alternativeHooks || []).filter((h) => h.trim()),
      };

      if (editingIdeaId) {
        await IdeaService.updateIdea(currentWorkspace.id, editingIdeaId, payload);
        setSuccessMessage('Content idea updated!');
      } else {
        await IdeaService.createIdea(currentWorkspace.id, payload);
        setSuccessMessage('New content idea saved to workspace!');
      }

      setIsIdeaModalOpen(false);
      loadIdeas();
    } catch (err) {
      setError(err.message || 'Failed to save idea.');
    }
  };

  const handleDeleteIdea = async (ideaId) => {
    if (!confirm('Are you sure you want to delete this content idea?')) return;
    try {
      await IdeaService.deleteIdea(currentWorkspace.id, ideaId);
      loadIdeas();
      setSuccessMessage('Content idea removed.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickStatusChange = async (ideaId, newStatus) => {
    try {
      await IdeaService.updateIdea(currentWorkspace.id, ideaId, { status: newStatus });
      loadIdeas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateAi = async (e) => {
    e.preventDefault();
    setAiGenerating(true);
    setError(null);

    try {
      const result = await IdeaService.generateAiIdeas(currentWorkspace.id, {
        topic: aiTopic || `Viral content angles in ${aiNiche}`,
        niche: aiNiche,
        targetAudience: aiAudience,
        format: aiFormat,
        count: Number(aiCount) || 3,
        additionalInstructions: aiInstructions,
        saveImmediately: false,
      });

      setGeneratedBatch(result.ideas || []);
    } catch (err) {
      setError(err.message || 'Gemini generation encountered an issue. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveBatchIdea = async (item) => {
    try {
      await IdeaService.createIdea(currentWorkspace.id, {
        title: item.title,
        concept: item.concept,
        niche: aiNiche,
        targetAudience: aiAudience,
        format: item.format || aiFormat,
        mainHook: item.hook,
        alternativeHooks: item.alternativeHooks || [],
        audienceProblem: item.audienceProblem,
        viewerValue: item.viewerValue,
        cta: item.cta,
        priorityScore: item.score || 85,
        scoreExplanation: item.scoreExplanation,
        status: 'draft',
      });

      setGeneratedBatch((prev) => prev.filter((i) => i.title !== item.title));
      loadIdeas();
      setSuccessMessage(`Saved "${item.title}" to Idea Studio!`);
    } catch (err) {
      setError(err.message);
    }
  };

  const getScoreBadgeColor = (score) => {
    const s = Number(score) || 0;
    if (s >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (s >= 70) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Idea Studio"
        description="Organize, brainstorm, and score viral video concepts with explainable prioritization."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAiModalOpen(true)}
              className="gap-2 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Custom AI Brainstorm
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenNewModal}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Idea
            </Button>
          </div>
        }
      />

      {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}
      {successMessage && <AlertBanner type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}

      {/* Proactive 1-Click Suggestion Banner */}
      <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-purple-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Creator Niche: {activeNiche}
            </span>
          </div>
          <h3 className="text-sm font-bold text-zinc-100">
            Need inspiration right now? Let Creator OS auto-generate 3 viral reel concepts.
          </h3>
          <p className="text-xs text-zinc-400">
            Trained on top vertical video retention curves, psychological hooks, and clear CTAs.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleQuickSuggestForNiche}
          disabled={quickGenerating}
          className="shrink-0 gap-2 shadow-lg shadow-indigo-600/25 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
        >
          {quickGenerating ? (
            <>
              <Spinner className="h-4 w-4" />
              Generating Viral Concepts...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-amber-300" />
              ✨ Suggest Viral Ideas for {activeNiche}
            </>
          )}
        </Button>
      </div>

      {/* Trending Angles Inspiration Shelf */}
      {trendingInspirations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              Breakout Trend Angles in {activeNiche} (1-Click Add)
            </h4>
            <Link to="/research" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              View Full Trend Radar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {trendingInspirations.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">{item.platform}</span>
                    <Badge variant="success" className="text-[10px]">{item.momentum}</Badge>
                  </div>
                  <h5 className="text-xs font-bold text-zinc-100 line-clamp-1">{item.title}</h5>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 italic">
                    Hook: "{item.sampleHook}"
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIdeaFormData({
                        title: item.title,
                        concept: item.whyItWorks,
                        format: 'reel',
                        niche: activeNiche,
                        targetAudience: activeAudience,
                        mainHook: item.sampleHook,
                        alternativeHooks: [],
                        audienceProblem: '',
                        viewerValue: '',
                        cta: '',
                        priorityScore: item.opportunityScore || 90,
                        status: 'draft',
                        trendId: null,
                      });
                      setIsIdeaModalOpen(true);
                    }}
                    className="text-xs h-7 gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Turn into Idea
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between pt-2">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'draft', 'in_progress', 'scripted', 'produced', 'published', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="w-40 text-xs py-1.5"
          >
            <option value="all">All Formats</option>
            <option value="reel">Reel / Short</option>
            <option value="long_video">Long-Form Video</option>
            <option value="carousel">Carousel</option>
            <option value="thread">Thread / Post</option>
            <option value="newsletter">Newsletter</option>
          </Select>

          <Input
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 text-xs"
          />
        </div>
      </div>

      {/* Ideas Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-indigo-500" />
        </div>
      ) : ideas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No content ideas found"
          description={`Click 'Suggest Viral Ideas' above or pick one of the trending formats from ${activeNiche}.`}
          actionLabel="Suggest Viral Ideas Now"
          onAction={handleQuickSuggestForNiche}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => {
            const score = Number(idea.priorityScore) || 75;
            return (
              <Card
                key={idea.id}
                className="border-zinc-800/80 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900/80 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize font-mono">
                      {idea.format?.replace('_', ' ')}
                    </Badge>

                    {/* Explainable Prioritization Badge */}
                    <button
                      onClick={() => setScoreModalIdea(idea)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border transition-colors ${getScoreBadgeColor(
                        score
                      )}`}
                      title="Click to view explainable score breakdown"
                    >
                      <span>{Math.round(score)}</span>
                      <span className="text-[10px] opacity-75">/ 100</span>
                      <HelpCircle className="h-3 w-3 opacity-60 ml-0.5" />
                    </button>
                  </div>

                  <CardTitle className="text-base text-zinc-100 mt-2 leading-snug line-clamp-2 font-bold">
                    {idea.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-300 mt-1 line-clamp-2">
                    {idea.concept}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {/* Hook highlight */}
                  {idea.mainHook && (
                    <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block mb-1 flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        First 3 Seconds Hook:
                      </span>
                      <p className="text-zinc-100 line-clamp-2 font-medium italic">"{idea.mainHook}"</p>
                    </div>
                  )}

                  {/* Status & Actions Footer */}
                  <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
                    <Select
                      value={idea.status}
                      onChange={(e) => handleQuickStatusChange(idea.id, e.target.value)}
                      className="text-xs py-0.5 h-6 w-28 bg-zinc-900 border-zinc-700"
                    >
                      <option value="draft">Draft</option>
                      <option value="in_progress">In Progress</option>
                      <option value="scripted">Scripted</option>
                      <option value="produced">Produced</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </Select>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditModal(idea)}
                        className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Explainable Score Breakdown Modal */}
      {scoreModalIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Score Breakdown</h3>
                <p className="text-xs text-zinc-400">{scoreModalIdea.title}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreBadgeColor(
                  scoreModalIdea.priorityScore
                )}`}
              >
                {Math.round(scoreModalIdea.priorityScore)} / 100
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-normal">
              Creator OS evaluates each idea across 5 performance vectors to maximize watch time and prevent creative burnout:
            </p>

            <div className="space-y-3 pt-2">
              {[
                { label: 'Niche Relevance', val: scoreModalIdea.scoreExplanation?.nicheRelevance ?? 85, desc: 'Alignment with target creator niche' },
                { label: 'Audience Interest', val: scoreModalIdea.scoreExplanation?.audienceInterest ?? 88, desc: 'Predicted viewer hook retention' },
                { label: 'Uniqueness', val: scoreModalIdea.scoreExplanation?.uniqueness ?? 80, desc: 'Differentiation from saturated competitors' },
                { label: 'Format Suitability', val: scoreModalIdea.scoreExplanation?.formatSuitability ?? 90, desc: 'Optimal pacing for vertical video' },
                { label: 'Research Support', val: scoreModalIdea.scoreExplanation?.researchSupport ?? 80, desc: 'Validated evidence from trending topics' },
              ].map((dim, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-200">{dim.label}</span>
                    <span className="font-bold text-indigo-400">{dim.val}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${dim.val}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500">{dim.desc}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="outline" size="sm" onClick={() => setScoreModalIdea(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Idea Generation Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">AI Concept Brainstorm</h3>
                  <p className="text-xs text-zinc-400">Powered by Gemini with structured retention analysis.</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAiModalOpen(false);
                  setGeneratedBatch([]);
                }}
              >
                ✕
              </Button>
            </div>

            {/* Smart Prompt Presets */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400">Quick Prompt Templates:</span>
              <div className="flex flex-wrap gap-1.5">
                {SMART_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setAiTopic(prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors"
                  >
                    + {prompt}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerateAi} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Focus Topic / Core Theme *</label>
                <Input
                  required
                  placeholder={`e.g. 3 high-protein meal prep recipes for ${activeNiche}`}
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Creator Niche</label>
                  <Input
                    value={aiNiche}
                    onChange={(e) => setAiNiche(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Target Format</label>
                  <Select value={aiFormat} onChange={(e) => setAiFormat(e.target.value)}>
                    <option value="reel">Reel / Short</option>
                    <option value="long_video">Long-Form Video</option>
                    <option value="carousel">Carousel</option>
                    <option value="thread">Thread</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Count</label>
                  <Select value={aiCount} onChange={(e) => setAiCount(e.target.value)}>
                    <option value="2">2 Ideas</option>
                    <option value="3">3 Ideas</option>
                    <option value="5">5 Ideas</option>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" disabled={aiGenerating} className="gap-2">
                  {aiGenerating ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Gemini is generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Concepts
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Generated Batch Preview */}
            {generatedBatch.length > 0 && (
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Generated Concepts ({generatedBatch.length})
                </h4>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {generatedBatch.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-2 hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-bold text-zinc-100">{item.title}</h5>
                        <Badge variant="primary" className="text-xs font-bold font-mono">
                          {item.score || 85}/100
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-300">{item.concept}</p>
                      {item.hook && (
                        <p className="text-xs text-amber-300 italic bg-zinc-900/60 p-2 rounded">
                          Hook: "{item.hook}"
                        </p>
                      )}
                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveBatchIdea(item)}
                          className="text-xs gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Save to Workspace
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual / Edit Idea Modal */}
      {isIdeaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 my-8">
            <h3 className="text-lg font-bold text-zinc-100">
              {editingIdeaId ? 'Edit Content Idea' : 'Create New Content Idea'}
            </h3>

            <form onSubmit={handleSaveIdea} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Idea Title *</label>
                <Input
                  required
                  placeholder="e.g. 3 Gym Mistakes Hurting Your Gains"
                  value={ideaFormData.title}
                  onChange={(e) => setIdeaFormData({ ...ideaFormData, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Core Concept & Summary *</label>
                <Textarea
                  required
                  rows={2}
                  placeholder="Brief summary of the video narrative or deliverable..."
                  value={ideaFormData.concept}
                  onChange={(e) => setIdeaFormData({ ...ideaFormData, concept: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Format</label>
                  <Select
                    value={ideaFormData.format}
                    onChange={(e) => setIdeaFormData({ ...ideaFormData, format: e.target.value })}
                  >
                    <option value="reel">Reel / Short</option>
                    <option value="long_video">Long-Form Video</option>
                    <option value="carousel">Carousel</option>
                    <option value="thread">Thread / Post</option>
                    <option value="newsletter">Newsletter</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Status</label>
                  <Select
                    value={ideaFormData.status}
                    onChange={(e) => setIdeaFormData({ ...ideaFormData, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="scripted">Scripted</option>
                    <option value="produced">Produced</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Main Opening Hook</label>
                <Input
                  placeholder="The primary hook that stops vertical scrolling..."
                  value={ideaFormData.mainHook}
                  onChange={(e) => setIdeaFormData({ ...ideaFormData, mainHook: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Audience Problem Solved</label>
                  <Input
                    placeholder="e.g. Elbow pain on bench press"
                    value={ideaFormData.audienceProblem}
                    onChange={(e) => setIdeaFormData({ ...ideaFormData, audienceProblem: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Call to Action (CTA)</label>
                  <Input
                    placeholder="e.g. Save this for your next chest day"
                    value={ideaFormData.cta}
                    onChange={(e) => setIdeaFormData({ ...ideaFormData, cta: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Priority Score (0 - 100)</span>
                  <span className="font-bold text-indigo-400">{ideaFormData.priorityScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ideaFormData.priorityScore}
                  onChange={(e) => setIdeaFormData({ ...ideaFormData, priorityScore: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsIdeaModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingIdeaId ? 'Update Idea' : 'Save Idea'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
