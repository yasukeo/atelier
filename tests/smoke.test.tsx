import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

it('renders homepage hero image', () => {
  render(<Home />);
  expect(screen.getByAltText(/next\.js logo/i)).toBeInTheDocument();
});
