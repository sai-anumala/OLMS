jest.mock("../store/AuthContextProvider", () => ({ useAuth: jest.fn() }));

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { useAuth } from "../store/AuthContextProvider";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>login page</p>} />
        <Route path="/user" element={<ProtectedRoute role="user"><p>user page</p></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><p>admin page</p></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>,
  );

const mockAuth = (value: Record<string, unknown>) => (useAuth as jest.Mock).mockReturnValue(value);

describe("ProtectedRoute", () => {
  it("waits for the session check instead of redirecting on page refresh", () => {
    mockAuth({ pageLoading: true, loginStatus: false, currentUser: null });
    renderAt("/user");
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    expect(screen.queryByText("login page")).toBeNull();
  });

  it("redirects logged-out visitors to /login", () => {
    mockAuth({ pageLoading: false, loginStatus: false, currentUser: null });
    renderAt("/user");
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("shows the page to a user with the right role", () => {
    mockAuth({ pageLoading: false, loginStatus: true, currentUser: { role: "user" } });
    renderAt("/user");
    expect(screen.getByText("user page")).toBeInTheDocument();
  });

  it("keeps normal users out of admin pages", () => {
    mockAuth({ pageLoading: false, loginStatus: true, currentUser: { role: "user" } });
    renderAt("/admin");
    expect(screen.queryByText("admin page")).toBeNull();
    expect(screen.getByText("user page")).toBeInTheDocument();
  });
});
