import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the RescueMePets landing page', () => {
  render(<App />);
  const linkElement = screen.getByText(/every pet/i);
  expect(linkElement).toBeInTheDocument();
});
