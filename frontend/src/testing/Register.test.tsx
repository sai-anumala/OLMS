jest.mock("../services/user", () => ({ registerUser: jest.fn() }));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/landingPage/Register";
import { registerUser } from "../services/user";

const renderRegister = () => render(<MemoryRouter><Register /></MemoryRouter>);

describe("Register Component", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the registration form with all input fields", () => {
    renderRegister();
    expect(screen.getByText(/OLMS Registration/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitting an empty form", async () => {
    renderRegister();
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));
    expect(await screen.findByText(/Username is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Mobile number is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("sends only the typed fields and shows the server's success message", async () => {
    (registerUser as jest.Mock).mockResolvedValueOnce({ status: 201, data: { message: "User Created Successfully" } });
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText(/Enter Username/i), { target: { value: "sairam" } });
    fireEvent.change(screen.getByPlaceholderText(/Mobile Number/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "sairam02@gmail.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => expect(screen.getByText(/User Created Successfully/i)).toBeInTheDocument());
    expect(registerUser).toHaveBeenCalledWith({ username: "sairam", mobile: "9876543210", email: "sairam02@gmail.com", password: "123456" });
  });
});
