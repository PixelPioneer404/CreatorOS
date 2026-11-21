import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Card, CardTitle, CardContent } from '../components/ui/card.jsx';
import { EmptyState } from '../components/ui/empty-state.jsx';
import { Sparkles } from 'lucide-react';

describe('UI Design System Components', () => {
  it('renders Button with correct text and handles disabled/loading state', () => {
    const { rerender } = render(<Button>Save Profile</Button>);
    expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();

    rerender(<Button isLoading>Save Profile</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders Input with proper placeholder and error styling', () => {
    render(<Input placeholder="Enter creator handle" error />);
    const input = screen.getByPlaceholderText('Enter creator handle');
    expect(input).toBeInTheDocument();
    expect(input.className).toContain('border-red-500');
  });

  it('renders Badge with upcoming variant', () => {
    render(<Badge variant="upcoming">Upcoming V2</Badge>);
    expect(screen.getByText('Upcoming V2')).toBeInTheDocument();
  });

  it('renders Card with header title and content', () => {
    render(
      <Card>
        <CardTitle>Creator Studio</CardTitle>
        <CardContent>Workspace active</CardContent>
      </Card>
    );
    expect(screen.getByText('Creator Studio')).toBeInTheDocument();
    expect(screen.getByText('Workspace active')).toBeInTheDocument();
  });

  it('renders EmptyState with icon, title and description', () => {
    render(
      <EmptyState
        icon={Sparkles}
        title="No Content Ideas Yet"
        description="Ideas will appear once Idea Studio is deployed in V2."
      />
    );
    expect(screen.getByText('No Content Ideas Yet')).toBeInTheDocument();
    expect(screen.getByText(/ideas will appear once idea studio/i)).toBeInTheDocument();
  });
});
