import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResearchLab } from '../features/research/ResearchLab.jsx';
import { IdeaStudio } from '../features/ideas/IdeaStudio.jsx';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { useWorkspaceStore } from '../store/useWorkspaceStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { ResearchService } from '../services/research.service.js';
import { HookService } from '../services/hook.service.js';
import { IdeaService } from '../services/idea.service.js';

vi.mock('../services/research.service.js', () => ({
  ResearchService: {
    listTrends: vi.fn().mockResolvedValue([
      {
        id: 'trend-1',
        title: 'Local AI Voice Cloning',
        description: 'Zero latency voice models for vertical video',
        niche: 'AI & Tech',
        status: 'emerging',
        opportunityScore: '92',
      },
    ]),
    listSources: vi.fn().mockResolvedValue([]),
    createTrend: vi.fn().mockResolvedValue({ id: 'trend-2' }),
    updateTrend: vi.fn().mockResolvedValue({ id: 'trend-1' }),
    deleteTrend: vi.fn().mockResolvedValue({}),
    startResearch: vi.fn().mockResolvedValue({
      summary: 'High demand for offline video AI tools',
      trends: [],
      contentGaps: ['Privacy-first video editing'],
    }),
  },
}));

vi.mock('../services/hook.service.js', () => ({
  HookService: {
    listHooks: vi.fn().mockResolvedValue([
      {
        id: 'hook-1',
        category: 'curiosity',
        text: 'Most people think AI will replace creators, but here is what really happens.',
        performanceNotes: 'High comment retention hook',
      },
    ]),
    createHook: vi.fn().mockResolvedValue({ id: 'hook-2' }),
    deleteHook: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../services/idea.service.js', () => ({
  IdeaService: {
    listIdeas: vi.fn().mockResolvedValue([
      {
        id: 'idea-1',
        title: '3 Local AI Tools You Can Run Offline',
        concept: 'Showcase private open-source tools',
        format: 'reel',
        priorityScore: '89.00',
        scoreExplanation: {
          nicheRelevance: 90,
          audienceInterest: 85,
          uniqueness: 80,
          formatSuitability: 90,
          researchSupport: 75,
        },
        mainHook: 'You do not need internet to run these 3 AI tools.',
        status: 'draft',
      },
    ]),
    createIdea: vi.fn().mockResolvedValue({ id: 'idea-2' }),
    updateIdea: vi.fn().mockResolvedValue({ id: 'idea-1' }),
    deleteIdea: vi.fn().mockResolvedValue({}),
    generateAiIdeas: vi.fn().mockResolvedValue({
      ideas: [
        {
          title: 'Offline Video Assistant',
          concept: 'Local transcription workflow',
          hook: 'Never upload your video to the cloud again',
          score: 85,
          format: 'reel',
        },
      ],
    }),
  },
}));

describe('V2 Feature Component Tests', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      currentWorkspace: { id: 'workspace-test-1', name: 'Test Studio' },
    });
    useAuthStore.setState({
      creatorProfile: {
        primaryNiche: 'AI & Tech',
        targetAudience: 'Solo Creators',
      },
    });
  });

  describe('1. Sidebar Navigation for V2', () => {
    it('activates Research Lab and Idea Studio as accessible routes', () => {
      render(
        <MemoryRouter>
          <Sidebar isOpen={true} onClose={() => {}} />
        </MemoryRouter>
      );

      // Verify V2 version badge
      expect(screen.getByText(/V2 Research & Ideas/i)).toBeInTheDocument();

      // Verify Research Lab and Idea Studio are rendered as links
      const researchLink = screen.getByRole('link', { name: /research lab/i });
      expect(researchLink).toBeInTheDocument();
      expect(researchLink.getAttribute('href')).toBe('/research');

      const ideasLink = screen.getByRole('link', { name: /idea studio/i });
      expect(ideasLink).toBeInTheDocument();
      expect(ideasLink.getAttribute('href')).toBe('/ideas');

      // Verify Script Studio is still an upcoming module (V3)
      expect(screen.getByText(/Script Studio/i)).toBeInTheDocument();
      expect(screen.getByText('V3')).toBeInTheDocument();
    });
  });

  describe('2. Research Lab Feature', () => {
    it('renders tabs and AI Trend Discovery prompt controls', async () => {
      render(
        <MemoryRouter>
          <ResearchLab />
        </MemoryRouter>
      );

      // Verify tabs exist
      expect(screen.getByRole('button', { name: /ai trend discovery/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tracked trends/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /hook intelligence/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sources/i })).toBeInTheDocument();

      // Verify Discovery Form
      expect(screen.getByPlaceholderText(/e\.g\. Local AI tools/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analyze trends with gemini/i })).toBeInTheDocument();
    });

    it('navigates to Hook Intelligence tab and displays curated hooks with copy action', async () => {
      render(
        <MemoryRouter>
          <ResearchLab />
        </MemoryRouter>
      );

      // Click Hook Intelligence tab
      const hooksTab = screen.getByRole('button', { name: /hook intelligence/i });
      fireEvent.click(hooksTab);

      // Wait for hooks to render
      await waitFor(() => {
        expect(screen.getByText(/Most people think AI will replace creators/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
      });
    });
  });

  describe('3. Idea Studio Feature', () => {
    it('renders Idea Studio header, priority scores, and filter controls', async () => {
      render(
        <MemoryRouter>
          <IdeaStudio />
        </MemoryRouter>
      );

      // Verify header and action buttons
      expect(screen.getByText('Idea Studio')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate with ai/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /new idea/i })).toBeInTheDocument();

      // Wait for ideas to render
      await waitFor(() => {
        expect(screen.getByText('3 Local AI Tools You Can Run Offline')).toBeInTheDocument();
        // Priority score badge: 89 / 100
        expect(screen.getByText('89')).toBeInTheDocument();
        expect(screen.getByText('/ 100')).toBeInTheDocument();
      });
    });

    it('opens AI brainstorming modal with Gemini parameters', () => {
      render(
        <MemoryRouter>
          <IdeaStudio />
        </MemoryRouter>
      );

      // Click Generate with AI
      fireEvent.click(screen.getByRole('button', { name: /generate with ai/i }));

      // Modal appears
      expect(screen.getByText(/Brainstorm with Gemini 3.8 Flash/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e\.g\. 5 AI productivity automations/i)).toBeInTheDocument();
    });
  });
});
