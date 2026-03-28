import { render, screen } from "@testing-library/react";
import UserGreet from "../components/user/UserGreet";
import { useAuth } from "../store/AuthContextProvider";

// Mock the entire AuthContextProvider module
jest.mock("../store/AuthContextProvider");

describe("UserGreet Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the user dashboard greeting with uppercase username", () => {
    const mockUser = { username: "testuser", role: "user" };
    (useAuth as jest.Mock).mockReturnValue({ currentUser: mockUser });

    render(<UserGreet />);

    const greetingText = screen.getByText(/Welcome to Your Library Dashboard -TESTUSER/i);
    expect(greetingText).toBeInTheDocument();
  });

  it("should render the admin dashboard greeting when role is admin", () => {
    const mockUser = { username: "adminuser", role: "admin" };
    (useAuth as jest.Mock).mockReturnValue({ currentUser: mockUser });

    render(<UserGreet />);

    const greetingText = screen.getByText(/Welcome to the Admin Dashboard -/i);
    expect(greetingText).toBeInTheDocument();
    expect(screen.getByText(/adminuser/i)).toBeInTheDocument();
  });

  it("should not render anything when no user is logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({ currentUser: null });

    render(<UserGreet />);

    const greetingText = screen.queryByText(/Welcome/i);
    expect(greetingText).toBeNull();
  });
});
