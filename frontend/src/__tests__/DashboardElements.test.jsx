import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WebcamComponent } from '../components/DashboardElements';

vi.mock('react-webcam', () => ({
  default: () => <div data-testid="mock-webcam" />
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children }) => <a>{children}</a>,
  useLocation: () => ({ pathname: '/dashboard' })
}));

describe('WebcamComponent Component', () => {
  it('should render the offline state initially', () => {
    render(<WebcamComponent onPredictionUpdate={vi.fn()} />);
    expect(screen.getByText('Webcam Feed Offline')).toBeInTheDocument();
    expect(screen.getByText('Start Camera')).toBeInTheDocument();
  });

  it('should switch to streaming state when start button is clicked', () => {
    render(<WebcamComponent onPredictionUpdate={vi.fn()} />);
    const startButton = screen.getByText('Start Camera');
    fireEvent.click(startButton);
    
    expect(screen.queryByText('Webcam Feed Offline')).not.toBeInTheDocument();
    expect(screen.getByText('Stop Stream')).toBeInTheDocument();
    expect(screen.getByTestId('mock-webcam')).toBeInTheDocument();
  });
});
