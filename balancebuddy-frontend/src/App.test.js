import { render, screen } from "@testing-library/react";

jest.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }) => <>{children}</>,
  Routes: ({ children }) => <>{children}</>,
  Route: ({ element }) => element,
  Link: ({ children }) => <>{children}</>,
  useLocation: () => ({ pathname: "/dashboard" }),
}), { virtual: true });

jest.mock("./pages/ExpensesPage", () => () => <div>Expenses Page</div>);
jest.mock("./pages/IncomesPage", () => () => <div>Incomes Page</div>);
jest.mock("./pages/ImportStatementsPage", () => () => <div>Import Page</div>);
jest.mock("./pages/SettingsPage", () => () => <div>Settings Page</div>);
jest.mock("./pages/DatabasePage", () => () => <div>Database Page</div>);
jest.mock("./pages/Dashboard", () => () => <div>Dashboard Page</div>);

import App from "./App";

test("renders the main application shell", () => {
  render(<App />);

  expect(screen.getByText(/balancebuddy/i)).toBeInTheDocument();
  expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  expect(screen.getByText("Expenses Page")).toBeInTheDocument();
});
