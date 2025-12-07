import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from "./contexts/AuthContext";

test("renders AdNova app or navbar", async () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  // Wait for the navbar / app name to appear
  const element = await screen.findAllByText(/adnova/i, {}, { timeout: 3000 });

  expect(element.length).toBeGreaterThan(0);
});
