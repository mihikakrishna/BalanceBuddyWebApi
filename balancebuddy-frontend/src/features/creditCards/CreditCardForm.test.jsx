import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
    LocalizationProvider: ({ children }) => <>{children}</>,
}));

jest.mock("@mui/x-date-pickers/DatePicker", () => ({
    DatePicker: ({ label, value, onChange, renderInput }) =>
        renderInput({
            label,
            value: value || "",
            onChange: (e) => onChange(e.target.value ? new Date(e.target.value) : null),
        }),
}));

jest.mock("@mui/x-date-pickers/AdapterDateFns", () => ({
    AdapterDateFns: function AdapterDateFns() { },
}));

import CreditCardForm from "./CreditCardForm";

describe("CreditCardForm", () => {
    test("requires opened date before submit", async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);

        const { container } = render(<CreditCardForm onSubmit={onSubmit} />);

        fireEvent.click(screen.getAllByRole("button")[0]);

        fireEvent.change(screen.getByLabelText(/Card Name/i), {
            target: { value: "Sapphire Preferred" },
        });
        fireEvent.change(screen.getByLabelText(/Issuer/i), {
            target: { value: "Chase" },
        });
        fireEvent.change(container.querySelector('input[name="annualFee"]'), {
            target: { value: "95" },
        });
        fireEvent.change(container.querySelector('input[name="pointsBalance"]'), {
            target: { value: "10000" },
        });
        fireEvent.change(container.querySelector('input[name="creditLimit"]'), {
            target: { value: "12000" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Create/i }));

        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByText(/Opened date is required/i)).toBeInTheDocument();
    });
});
