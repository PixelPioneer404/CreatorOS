import { create } from 'zustand';
import { WorkspaceService } from '../services/workspace.service.js';
import { CreatorService } from '../services/creator.service.js';

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  creatorProfile: null,
  isLoading: false,
  error: null,

  loadWorkspaces: async (fallbackName = 'My Studio') => {
    set({ isLoading: true, error: null });
    try {
      let list = await WorkspaceService.list();

      // If user has no workspace yet, initialize one idempotently
      if (!list || list.length === 0) {
        const initialized = await WorkspaceService.createOrInit(fallbackName);
        list = [initialized];
      }

      const activeWorkspace = list[0];
      set({ workspaces: list, currentWorkspace: activeWorkspace });

      if (activeWorkspace) {
        try {
          const profile = await CreatorService.getProfile(activeWorkspace.id);
          set({ creatorProfile: profile, isLoading: false });
        } catch {
          // If profile not created yet, set placeholder
          set({
            creatorProfile: {
              workspaceId: activeWorkspace.id,
              displayName: activeWorkspace.name,
              onboardingCompleted: false,
            },
            isLoading: false,
          });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  setCurrentWorkspace: async (workspace) => {
    set({ currentWorkspace: workspace, isLoading: true });
    try {
      const profile = await CreatorService.getProfile(workspace.id);
      set({ creatorProfile: profile, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  saveProfile: async (data) => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) throw new Error('No active workspace selected.');

    set({ isLoading: true, error: null });
    try {
      const updated = await CreatorService.upsertProfile(currentWorkspace.id, data);
      set({ creatorProfile: updated, isLoading: false });
      return updated;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updatePartialProfile: async (data) => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) throw new Error('No active workspace selected.');

    set({ isLoading: true, error: null });
    try {
      const updated = await CreatorService.updateProfile(currentWorkspace.id, data);
      set({ creatorProfile: updated, isLoading: false });
      return updated;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
