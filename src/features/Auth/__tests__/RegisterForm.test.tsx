
 // @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "../Components/RegisterForm";
import { getLocations, registerUser } from "../auth-api";

vi.mock("../auth-api", () => ({
  getLocations: vi.fn(),
  registerUser: vi.fn(),
}));

describe("RegisterForm", () => {
  const onBack = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(getLocations).mockResolvedValue({
      ok: true,
      data: {
        buildings: [{ id: 1, name: "Bygning A" }],
        floors: [
          { id: 2, buildingId: 1, number: 2 },
          { id: 3, buildingId: 1, number: 3 },
        ],
      },
    });
  });

  it("lar brukeren velge bygning og etasje", async () => {
    const user = userEvent.setup();

    render(<RegisterForm onBack={onBack} />);

    await screen.findByRole("option", { name: "Bygning A" });

    await user.selectOptions(
      screen.getByLabelText("Bygning"),
      "1"
    );

    expect(
      screen.getByRole("option", { name: /Etasje\s*2/ })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Etasje")
    ).not.toBeDisabled();
  });

  it("registrerer en gyldig bruker", async () => {
    const user = userEvent.setup();

    vi.mocked(registerUser).mockResolvedValue({
      ok: true,
      data: {
        id: 1,
        firstName: "abdi",
        lastName: "rahman",
        email: "abdi@test.com",
        buildingId: 1,
        floorId: 2,
      },
    });

    render(<RegisterForm onBack={onBack} />);

    await screen.findByRole("option", { name: "Bygning A" });

    await user.type(screen.getByLabelText("Fornavn"), "abdi");
    await user.type(screen.getByLabelText("Etternavn"), "rahman");
    await user.type(screen.getByLabelText("E-post"), "abdi@test.com");

    await user.type(
      screen.getByLabelText("Passord (minst 8 tegn)"),
      "test1234"
    );

    await user.type(
      screen.getByLabelText("Bekreft passord"),
      "test1234"
    );

    await user.selectOptions(
      screen.getByLabelText("Bygning"),
      "1"
    );

    await user.selectOptions(
      screen.getByLabelText("Etasje"),
      "2"
    );

    await user.click(
      screen.getByRole("button", { name: "Registrer bruker" })
    );

    expect(registerUser).toHaveBeenCalledWith({
      firstName: "abdi",
      lastName: "rahman",
      email: "abdi@test.com",
      password: "test1234",
      confirmPassword: "test1234",
      buildingId: 1,
      floorId: 2,
    });

    expect(onBack).toHaveBeenCalledOnce();
  });

  it("viser feilmelding hvis registrering mislykkes", async () => {
    const user = userEvent.setup();

    vi.mocked(registerUser).mockResolvedValue({
      ok: false,
      error: {
        code: "409",
        message: "E-posten er allerede registrert",
      },
    });

    render(<RegisterForm onBack={onBack} />);

    await screen.findByRole("option", { name: "Bygning A" });

    await user.type(screen.getByLabelText("Fornavn"), "abdi");
    await user.type(screen.getByLabelText("Etternavn"), "rahman");
    await user.type(screen.getByLabelText("E-post"), "abdi@test.com");

    await user.type(
      screen.getByLabelText("Passord (minst 8 tegn)"),
      "test1234"
    );

    await user.type(
      screen.getByLabelText("Bekreft passord"),
      "test1234"
    );

    await user.selectOptions(
      screen.getByLabelText("Bygning"),
      "1"
    );

    await user.selectOptions(
      screen.getByLabelText("Etasje"),
      "2"
    );

    await user.click(
      screen.getByRole("button", { name: "Registrer bruker" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("E-posten er allerede registrert");

    expect(onBack).not.toHaveBeenCalled();
  });
});
