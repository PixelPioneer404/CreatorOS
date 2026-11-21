import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore.js';
import { CreatorService } from '../../services/creator.service.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Select } from '../../components/ui/select.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card.jsx';
import { AlertBanner } from '../../components/ui/alert-banner.jsx';
import { Spinner } from '../../components/ui/loading-indicator.jsx';
import { Check, Save } from 'lucide-react';

const NICHE_OPTIONS = [
  'Tech & AI',
  'Software Development',
  'Fitness & Health',
  'Personal Finance & Investing',
  'Lifestyle & Productivity',
  'Fashion & Beauty',
  'Business & SaaS',
  'Travel & Adventure',
  'Education & Career',
  'Content Creation',
  'Food & Culinary',
  'Other',
];

const PLATFORM_OPTIONS = [
  'Instagram',
  'YouTube',
  'TikTok',
  'LinkedIn',
  'X / Twitter',
  'Substack / Newsletter',
];

const GOAL_OPTIONS = [
  'Grow audience reach & followers',
  'Build consistent content workflows',
  'Secure paid brand collaborations',
  'Monetize with digital products',
  'Improve script hooks & pacing',
  'Build professional creator portfolio',
];

export function ProfileSettings() {
  const { currentWorkspace, creatorProfile, updatePartialProfile } = useWorkspaceStore();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!currentWorkspace?.id) return;
      try {
        setLoading(true);
        const data = await CreatorService.getProfile(currentWorkspace.id);
        setFormData({
          displayName: data.displayName || '',
          username: data.username || '',
          bio: data.bio || '',
          primaryNiche: data.primaryNiche || 'Tech & AI',
          secondaryNiches: data.secondaryNiches || [],
          primaryPlatform: data.primaryPlatform || 'Instagram',
          otherPlatforms: data.otherPlatforms || [],
          goals: data.goals || [],
          targetAudience: data.targetAudience || '',
          experienceLevel: data.experienceLevel || 'Intermediate',
          preferredLanguage: data.preferredLanguage || 'English',
          country: data.country || 'United States',
          timezone: data.timezone || 'UTC',
        });
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err.message || 'Failed to load profile settings.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [currentWorkspace?.id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      setFeedback({
        type: 'error',
        message: 'Creator / Display Name cannot be empty.',
      });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await updatePartialProfile(formData);
      setFeedback({
        type: 'success',
        message: 'Creator profile updated successfully. All changes are saved and persisted.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to save profile changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Creator Profile Settings"
        description="View and update your creative identity, primary niche, goals, and target audience."
      />

      {feedback && (
        <AlertBanner
          variant={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity */}
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader>
            <CardTitle>Profile & Branding</CardTitle>
            <CardDescription>Public identification and description of your creator persona</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Creator / Display Name <span className="text-indigo-400">*</span>
                </label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Creator Username / Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">@</span>
                  <Input
                    className="pl-7"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Bio / Creator Description
              </label>
              <Textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="What topics do you cover?"
              />
            </div>
          </CardContent>
        </Card>

        {/* Niche & Audience */}
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader>
            <CardTitle>Niche & Target Audience</CardTitle>
            <CardDescription>Content category and audience demographic context</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Primary Content Niche
              </label>
              <Select
                value={formData.primaryNiche}
                onChange={(e) => handleChange('primaryNiche', e.target.value)}
              >
                {NICHE_OPTIONS.map((niche) => (
                  <option key={niche} value={niche}>{niche}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Secondary Niches
              </label>
              <div className="flex flex-wrap gap-2">
                {NICHE_OPTIONS.map((niche) => {
                  const selected = formData.secondaryNiches.includes(niche);
                  return (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => toggleArrayItem('secondaryNiches', niche)}
                      className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                        selected
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {niche} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Target Audience Description
              </label>
              <Textarea
                rows={3}
                value={formData.targetAudience}
                onChange={(e) => handleChange('targetAudience', e.target.value)}
                placeholder="Describe who your ideal viewer is..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals & Channels */}
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader>
            <CardTitle>Channels & Creator Goals</CardTitle>
            <CardDescription>Platforms and high-priority milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Primary Platform
              </label>
              <Select
                value={formData.primaryPlatform}
                onChange={(e) => handleChange('primaryPlatform', e.target.value)}
              >
                {PLATFORM_OPTIONS.map((platform) => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Creator Goals
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GOAL_OPTIONS.map((goal) => {
                  const selected = formData.goals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleArrayItem('goals', goal)}
                      className={`flex items-start text-left gap-2 rounded-lg p-2.5 text-xs border transition-colors ${
                        selected
                          ? 'bg-indigo-600/15 border-indigo-500/60 text-indigo-200'
                          : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/70'
                      }`}
                    >
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        selected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-zinc-600'
                      }`}>
                        {selected && <Check className="h-3 w-3" />}
                      </div>
                      <span>{goal}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-zinc-800 pt-5">
            <Button type="submit" isLoading={saving}>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
