// Mock the auth hook before importing the component
jest.mock("../store/AuthContextProvider", () => ({ useAuth: jest.fn() }));

const mockNavigate = jest.fn();
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockNavigate,
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../pages/landingPage/Login";
import { useAuth } from "../store/AuthContextProvider";

const mockAuth = (overrides: Record<string, unknown> = {}) => {
  const value = { isLoading: false, userLogin: jest.fn(), currentUser: null, loginError: null, ...overrides };
  (useAuth as jest.Mock).mockReturnValue(value);
  return value;
};

describe("Login Component", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders username and password fields", () => {
    mockAuth();
    render(<Login />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it("shows validation errors and does not log in when the form is empty", async () => {
    const auth = mockAuth();
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));
    expect(await screen.findByText(/Username is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
    expect(auth.userLogin).not.toHaveBeenCalled();
  });

  it("calls userLogin with the typed credentials", async () => {
    const auth = mockAuth();
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "sairam" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "secret1" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));
    await waitFor(() => expect(auth.userLogin).toHaveBeenCalledWith({ username: "sairam", password: "secret1" }));
  });

  it("shows the server's login error", () => {
    mockAuth({ loginError: "Invalid username or password" });
    render(<Login />);
    expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument();
  });

  it("redirects an admin to /admin after login", () => {
    mockAuth({ currentUser: { username: "boss", role: "admin" } });
    render(<Login />);
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });
});
