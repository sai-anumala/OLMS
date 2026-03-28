// Mock the RegisterContext module before importing anything from it
jest.mock("../services/user/RegisterApi", () => ({
  __esModule: true,
  RegisterApi: jest.fn(), // mock the factory function
}));

// necessary modules and components
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../pages/landingPage/Register";
import { MemoryRouter } from "react-router-dom"; // provides routing context for useNavigate
import { RegisterApi } from "../services/user/RegisterApi";
 
// Group all tests for the Register component
describe("Register Component", () => {
  // Test Case 1: Check if all input fields render correctly
  it("should render the registration form with all input fields", () => {
    // Provide a dummy implementation for the mocked hook
    (RegisterApi as jest.Mock).mockReturnValue({ registerUser: jest.fn() });
 
    // Render the component inside a router context
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
 
    // Assert that all expected elements are present
    expect(screen.getByText(/OLMS Registration/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });
 
  // Test Case 2: Trigger validation errors by submitting an empty form
  it("should show validation errors when submitting empty form", async () => {
    // Provide a dummy implementation again
    (RegisterApi as jest.Mock).mockReturnValue({ registerUser: jest.fn() });
 
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
 
    // Simulate clicking the submit button without filling the form
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));
 
    // Assert that all validation messages appear
    expect(await screen.findByText(/Username is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Mobile number is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
  });
 
  // Test Case 3: Simulate a successful registration
  it("should call registerUser and show success message", async () => {
    // Create a mock function to simulate successful API call
    const mockRegisterApi = jest.fn().mockResolvedValueOnce({
        status: 201,
        data: { message: "User Created Successfully" },
      });
  
    // Inject the mock into the hook
    (RegisterApi as jest.Mock).mockReturnValue({ registerApi: mockRegisterApi });
 
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
 
    // Fill out the form fields
    fireEvent.change(screen.getByPlaceholderText(/Enter Username/i), { target: { value: "sairam" } });
    fireEvent.change(screen.getByPlaceholderText(/Mobile Number/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "sairam02@gmail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "123456" } });
 
    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));
 
    // Wait for async logic to complete and assert success
    await waitFor(() => {
      expect(mockRegisterApi).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/User Created Successfully/i)).toBeInTheDocument();
    });
  });
 });



