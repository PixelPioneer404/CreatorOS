import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { apiRequest, setMockToken } from '../lib/api-client.js';

export const AuthService = {
  async signUp(email, password, displayName) {
    if (!isSupabaseConfigured) {
      // Offline/Dev Mock Mode
      const mockUserId = `local-${Date.now()}`;
      const mockToken = `test-token-${mockUserId}`;
      localStorage.setItem('creatoros_auth_token', mockToken);
      localStorage.setItem('creatoros_mock_user', JSON.stringify({
        id: mockUserId,
        email,
        displayName: displayName || email.split('@')[0],
      }));
      setMockToken(mockToken);
      return {
        user: { id: mockUserId, email, displayName },
        session: { access_token: mockToken },
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    if (!isSupabaseConfigured) {
      // Check if user was registered locally or create mock session
      const saved = localStorage.getItem('creatoros_mock_user');
      const user = saved ? JSON.parse(saved) : {
        id: `local-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
      };
      const mockToken = `test-token-${user.id}`;
      localStorage.setItem('creatoros_auth_token', mockToken);
      setMockToken(mockToken);
      return {
        user,
        session: { access_token: mockToken },
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    localStorage.removeItem('creatoros_auth_token');
    localStorage.removeItem('creatoros_mock_user');
    setMockToken(null);

    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  async resetPassword(email) {
    if (!isSupabaseConfigured) {
      return { message: 'Password reset link simulated in offline development mode.' };
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  async getSession() {
    if (!isSupabaseConfigured) {
      const token = localStorage.getItem('creatoros_auth_token');
      const savedUser = localStorage.getItem('creatoros_mock_user');
      if (token && savedUser) {
        setMockToken(token);
        return {
          user: JSON.parse(savedUser),
          session: { access_token: token },
        };
      }
      return null;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  },

  async getMe() {
    return apiRequest('/users/me');
  },

  async updateMe(data) {
    return apiRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
