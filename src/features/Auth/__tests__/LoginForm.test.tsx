
 // @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../Components/LoginForm";
import { loginUser } from "../auth-api";

vi.mock("../auth-api", () => ({
  loginUser: vi.fn(),
}));

describe("LoginForm", () => {
  const onLogin = vi.fn();
  const onRegister = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("logger inn med riktig e-post og passord", async () => {
    const user = userEvent.setup();

    const mockUser = {
      id: 1,
      firstName: "abdi",
      lastName: "rahman",
      email: "abdi@test.com",
      buildingId: 1,
      floorId: 2,
    };

    vi.mocked(loginUser).mockResolvedValue({
      ok: true,
      data: mockUser,
    });

    render(
      <LoginForm onLogin={onLogin} onRegister={onRegister} />
    );

    await user.type(
      screen.getByLabelText("E-post"),
      "abdi@test.com"
    );

    await user.type(
      screen.getByLabelText("Passord"),
      "test1234"
    );

    await user.click(
      screen.getByRole("button", { name: "Logg inn" })
    );

    expect(loginUser).toHaveBeenCalledWith({
      email: "abdi@test.com",
      password: "test1234",
    });

    expect(onLogin).toHaveBeenCalledWith(mockUser);
  });

  it("viser feilmelding ved feil innlogging", async () => {
    const user = userEvent.setup();

    vi.mocked(loginUser).mockResolvedValue({
      ok: false,
      error: {
        code: "401",
        message: "Feil e-post eller passord",
      },
    });

    render(
      <LoginForm onLogin={onLogin} onRegister={onRegister} />
    );

    await user.type(
      screen.getByLabelText("E-post"),
      "abdi@test.com"
    );

    await user.type(
      screen.getByLabelText("Passord"),
      "feilpassord"
    );

    await user.click(
      screen.getByRole("button", { name: "Logg inn" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Feil e-post eller passord");

    expect(onLogin).not.toHaveBeenCalled();
  });

  it("åpner registrering når brukeren klikker opprett bruker", async () => {
    const user = userEvent.setup();

    render(
      <LoginForm onLogin={onLogin} onRegister={onRegister} />
    );

    await user.click(
      screen.getByRole("button", { name: "Opprett bruker" })
    );

    expect(onRegister).toHaveBeenCalledOnce();
  });
});
