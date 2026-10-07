import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

describe('UI & Feedback Components', () => {
  it('renders Button with primary variant and handles click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Run Test</Button>);

    const button = screen.getByRole('button', { name: /run test/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders Button in loading state with aria-busy and without firing click', () => {
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Loading Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders Card with role="button", tabIndex=0, and keyboard activation when interactive', async () => {
    const handleClick = vi.fn();
    const { Card } = await import('@/components/ui/Card');
    render(
      <Card interactive onClick={handleClick} aria-label="Interactive Card">
        <span>Card Content</span>
      </Card>
    );

    const card = screen.getByRole('button', { name: /Interactive Card/i });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('tabIndex', '0');

    // Trigger Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Trigger Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);

    // Non-activation key should not trigger onClick
    fireEvent.keyDown(card, { key: 'ArrowRight' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('renders ProgressBar in determinate and indeterminate states', async () => {
    const { ProgressBar } = await import('@/components/ui/ProgressBar');
    const { rerender } = render(<ProgressBar value={45} max={100} label="Training Progress" showValueLabel />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '45');
    expect(screen.getByText('45%')).toBeInTheDocument();

    rerender(<ProgressBar indeterminate label="Compiling Nodes" />);
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
    expect(progressbar.querySelector('.animate-indeterminate')).toBeInTheDocument();
  });

  it('renders StatusBadge with neutral and ready states', () => {
    const { rerender } = render(<StatusBadge status="ready" label="READY" />);
    expect(screen.getByText('READY')).toBeInTheDocument();

    rerender(<StatusBadge status="not_started" label="Not started" />);
    expect(screen.getByText('Not started')).toBeInTheDocument();

    rerender(<StatusBadge status="not_trained" label="Not trained" />);
    expect(screen.getByText('Not trained')).toBeInTheDocument();
  });

  it('renders Badge with custom variants', () => {
    render(<Badge variant="accent">Module 01</Badge>);
    expect(screen.getByText('Module 01')).toBeInTheDocument();
  });

  it('renders EmptyState with badge, title and description', () => {
    render(
      <EmptyState
        badgeText="Available in the next module"
        title="Workflow Builder"
        description="Connect AI components into a safety workflow."
      />
    );

    expect(screen.getByText('Available in the next module')).toBeInTheDocument();
    expect(screen.getByText('Workflow Builder')).toBeInTheDocument();
    expect(screen.getByText('Connect AI components into a safety workflow.')).toBeInTheDocument();
  });

  it('catches render errors in ErrorBoundary and displays containment message', () => {
    // Suppress expected console.error during ErrorBoundary test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowingComponent = () => {
      throw new Error('Test boundary containment error');
    };

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Application Safety Boundary Triggered/i)).toBeInTheDocument();
    expect(screen.getByText(/Test boundary containment error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Platform Dashboard/i })).toBeInTheDocument();

    spy.mockRestore();
  });
});
