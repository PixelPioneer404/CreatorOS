import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../features/auth/Login.jsx';
import { Onboarding } from '../features/onboarding/Onboarding.jsx';

describe('Auth & Onboarding User Flows', () => {
  it('renders login form inputs and validation controls', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('creator@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders onboarding multi-step wizard and navigates through steps', async () => {
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>
    );

    // Step 1: Identity
    expect(screen.getByText(/Creator Profile & Branding/i)).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText('e.g. Alex Rivera');
    fireEvent.change(nameInput, { target: { value: 'Sam Wilson' } });

    // Click Continue to go to Step 2
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueBtn);

    // Step 2: Niche & Audience
    expect(screen.getByText(/Content Niche & Audience Target/i)).toBeInTheDocument();
    expect(screen.getByText(/Primary Content Niche/i)).toBeInTheDocument();

    // Click Continue to go to Step 3
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3: Platforms & Goals
    expect(screen.getByText(/Publishing Channels & Objectives/i)).toBeInTheDocument();

    // Click Previous to go back to Step 2
    const prevBtn = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevBtn);
    expect(screen.getByText(/Content Niche & Audience Target/i)).toBeInTheDocument();
  });
});
