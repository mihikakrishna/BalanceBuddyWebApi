import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CreditCardAnnualFeeChart from "./CreditCardAnnualFeeChart";

const mockBarChart = jest.fn(() => <div data-testid="bar-chart" />);

jest.mock("@mui/x-charts/BarChart", () => ({
    __esModule: true,
    BarChart: (props) => mockBarChart(props),
    default: (props) => mockBarChart(props),
}));

jest.mock("../../charts/ExpandableChart", () => ({
    __esModule: true,
    default: ({ title, subtitle, children }) => (
        <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
            {children}
        </div>
    ),
}));

describe("CreditCardAnnualFeeChart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-04-11T12:00:00Z"));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("maps open-card annual fees into 12-month bars and shows overdue count", async () => {
        const cards = [
            {
                id: 1,
                isClosed: false,
                annualFee: 95,
                reminderDate: "2026-04-25T00:00:00Z",
            },
            {
                id: 2,
                isClosed: false,
                annualFee: 199,
                reminderDate: "2026-06-10T00:00:00Z",
            },
            {
                id: 3,
                isClosed: false,
                annualFee: 120,
                reminderDate: "2026-03-01T00:00:00Z",
            },
            {
                id: 4,
                isClosed: true,
                annualFee: 500,
                reminderDate: "2026-06-20T00:00:00Z",
            },
        ];

        render(<CreditCardAnnualFeeChart cards={cards} />);

        await waitFor(() => expect(mockBarChart).toHaveBeenCalled());
        expect(screen.getByText(/Overdue cards: 1/i)).toBeInTheDocument();

        const props = mockBarChart.mock.calls[mockBarChart.mock.calls.length - 1][0];
        expect(props.series[0].data[0]).toBe(95);
        expect(props.series[0].data[2]).toBe(199);
    });

    test("shows no-due-dates message when open cards have no annual fee due date", () => {
        const cards = [
            { id: 1, isClosed: false, annualFee: 95, reminderDate: null },
            { id: 2, isClosed: false, annualFee: 199, reminderDate: null },
        ];

        render(<CreditCardAnnualFeeChart cards={cards} />);

        expect(
            screen.getByText(/No annual fee due dates set for open cards/i)
        ).toBeInTheDocument();
        expect(mockBarChart).not.toHaveBeenCalled();
    });
});
