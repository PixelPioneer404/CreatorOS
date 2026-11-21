import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useWorkspaceStore } from '../../store/useWorkspaceStore.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Select } from '../../components/ui/select.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card.jsx';
import { AlertBanner } from '../../components/ui/alert-banner.jsx';
import { Sparkles, ArrowRight, ArrowLeft, Check, Save } from 'lucide-react';

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

const EXPERIENCE_OPTIONS = [
  'Beginner (Just starting out)',
  'Intermediate (Consistent posting)',
  'Advanced (Growing monetization)',
  'Full-Time Creator',
];

export function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentWorkspace, creatorProfile, saveProfile, isLoading } = useWorkspaceStore();

  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    primaryNiche: 'Tech & AI',
    secondaryNiches: [],
    primaryPlatform: 'Instagram',
    otherPlatforms: [],
    goals: [],
    targetAudience: '',
    experienceLevel: 'Intermediate (Consistent posting)',
    preferredLanguage: 'English',
    country: 'United States',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  });

  // Pre-fill existing data if resuming onboarding
  useEffect(() => {
    if (creatorProfile) {
      setFormData((prev) => ({
        ...prev,
        displayName: creatorProfile.displayName || prev.displayName || user?.displayName || '',
        username: creatorProfile.username || prev.username || '',
        bio: creatorProfile.bio || prev.bio || '',
        primaryNiche: creatorProfile.primaryNiche || prev.primaryNiche,
        secondaryNiches: creatorProfile.secondaryNiches?.length ? creatorProfile.secondaryNiches : prev.secondaryNiches,
        primaryPlatform: creatorProfile.primaryPlatform || prev.primaryPlatform,
        otherPlatforms: creatorProfile.otherPlatforms?.length ? creatorProfile.otherPlatforms : prev.otherPlatforms,
        goals: creatorProfile.goals?.length ? creatorProfile.goals : prev.goals,
        targetAudience: creatorProfile.targetAudience || prev.targetAudience,
        experienceLevel: creatorProfile.experienceLevel || prev.experienceLevel,
        preferredLanguage: creatorProfile.preferredLanguage || prev.preferredLanguage,
        country: creatorProfile.country || prev.country,
        timezone: creatorProfile.timezone || prev.timezone,
      }));
    }
  }, [creatorProfile, user]);

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

  const handleSaveDraft = async () => {
    setError(null);
    try {
      await saveProfile({
        ...formData,
        onboardingCompleted: false,
      });
      setSaveStatus('Draft saved. You can safely return later to complete setup.');
    } catch (err) {
      setError(err.message || 'Failed to save progress.');
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.displayName.trim()) {
      setError('Creator / Display Name is required.');
      return;
    }
    setError(null);
    setSaveStatus(null);
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setError(null);
    setSaveStatus(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleComplete = async () => {
    setError(null);
    try {
      await saveProfile({
        ...formData,
        onboardingCompleted: true,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding. Please check required fields.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header and progress */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-1">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Creator Onboarding</h1>
          <p className="text-sm text-zinc-400">Establish your creative identity and platform context</p>
        </div>

        {/* Step indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-zinc-400 px-1">
            <span className={step >= 1 ? 'text-indigo-400' : ''}>1. Identity</span>
            <span className={step >= 2 ? 'text-indigo-400' : ''}>2. Niche & Audience</span>
            <span className={step >= 3 ? 'text-indigo-400' : ''}>3. Platforms & Goals</span>
            <span className={step >= 4 ? 'text-indigo-400' : ''}>4. Preferences</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <AlertBanner variant="error" message={error} onDismiss={() => setError(null)} />
        )}
        {saveStatus && (
          <AlertBanner variant="success" message={saveStatus} onDismiss={() => setSaveStatus(null)} />
        )}

        <Card className="border-zinc-800 bg-zinc-900/60 shadow-xl">
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Creator Profile & Branding'}
              {step === 2 && 'Content Niche & Audience Target'}
              {step === 3 && 'Publishing Channels & Objectives'}
              {step === 4 && 'Regional & Experience Settings'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Define how your brand appears across Creator OS.'}
              {step === 2 && 'This context powers AI research and scripting recommendations.'}
              {step === 3 && 'Select your active platforms and growth milestones.'}
              {step === 4 && 'Tailor language, timezone, and production context.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Creator / Display Name <span className="text-indigo-400">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Alex Rivera"
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
                      placeholder="alexrivera_tech"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Bio / Creator Description
                  </label>
                  <Textarea
                    placeholder="Brief description of the topics you cover and the value you provide..."
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* STEP 2: NICHE & AUDIENCE */}
            {step === 2 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Primary Content Niche <span className="text-indigo-400">*</span>
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
                    Secondary Niches (Select relevant topics)
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
                    placeholder="Who is watching your content? (e.g. Early-stage entrepreneurs, junior developers, gym beginners...)"
                    rows={3}
                    value={formData.targetAudience}
                    onChange={(e) => handleChange('targetAudience', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* STEP 3: PLATFORMS & GOALS */}
            {step === 3 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Primary Publishing Platform <span className="text-indigo-400">*</span>
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
                    Other Channels & Platforms
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map((platform) => {
                      const selected = formData.otherPlatforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => toggleArrayItem('otherPlatforms', platform)}
                          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                            selected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                              : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          {platform} {selected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Primary Creator Goals
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
              </>
            )}

            {/* STEP 4: PREFERENCES */}
            {step === 4 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Experience Level
                  </label>
                  <Select
                    value={formData.experienceLevel}
                    onChange={(e) => handleChange('experienceLevel', e.target.value)}
                  >
                    {EXPERIENCE_OPTIONS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Preferred Language
                    </label>
                    <Input
                      placeholder="e.g. English"
                      value={formData.preferredLanguage}
                      onChange={(e) => handleChange('preferredLanguage', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Country
                    </label>
                    <Input
                      placeholder="e.g. United States"
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Timezone
                  </label>
                  <Input
                    placeholder="e.g. America/New_York"
                    value={formData.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-zinc-800/80 pt-5">
            <div>
              {step > 1 ? (
                <Button variant="outline" size="sm" onClick={handleBack} disabled={isLoading}>
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleSaveDraft} disabled={isLoading}>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Draft</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {step > 1 && (
                <Button variant="ghost" size="sm" onClick={handleSaveDraft} disabled={isLoading}>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Draft</span>
                </Button>
              )}

              {step < 4 ? (
                <Button size="sm" onClick={handleNext} disabled={isLoading}>
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleComplete} isLoading={isLoading}>
                  <Check className="h-4 w-4" />
                  <span>Complete Setup</span>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
