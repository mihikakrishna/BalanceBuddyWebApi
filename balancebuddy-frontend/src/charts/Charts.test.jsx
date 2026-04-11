import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ExpenseByCategoryPie from "./ExpenseByCategoryPie";
import IncomeExpenseStackedBar from "./IncomeExpenseStackedBar";
import BankBalancesPie from "./BankBalancesPie";
import ExpenseBudgetHeatmap from "./ExpenseBudgetHeatmap";

const mockPieChart = jest.fn(() => <div data-testid="pie-chart" />);
const mockBarChart = jest.fn(() => <div data-testid="bar-chart" />);
const mockLineChart = jest.fn(() => <div data-testid="line-chart" />);

jest.mock("@mui/x-charts/PieChart", () => ({
    __esModule: true,
    PieChart: (props) => mockPieChart(props),
    default: (props) => mockPieChart(props),
}));

jest.mock("@mui/x-charts/BarChart", () => ({
    __esModule: true,
    BarChart: (props) => mockBarChart(props),
    default: (props) => mockBarChart(props),
}));

jest.mock("@mui/x-charts/LineChart", () => ({
    __esModule: true,
    LineChart: (props) => mockLineChart(props),
    default: (props) => mockLineChart(props),
}));

beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
});

afterEach(() => {
    delete global.fetch;
});

test("ExpenseByCategoryPie maps API rows and adds Other bucket", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
            { category: "Food", total: 200 },
            { category: "Travel", total: 150 },
            { category: "Utilities", total: 100 },
            { category: "Other A", total: 40 },
            { category: "Other B", total: 30 },
            { category: "Other C", total: 20 },
            { category: "Other D", total: 10 },
            { category: "Other E", total: 5 },
            { category: "Other F", total: 4 },
            { category: "Other G", total: 3 },
        ],
    });

    render(<ExpenseByCategoryPie />);

    await waitFor(() => expect(mockPieChart).toHaveBeenCalled());

    const props = mockPieChart.mock.calls[mockPieChart.mock.calls.length - 1][0];
    const mappedRows = props.series[0].data;

    expect(mappedRows.some((row) => row.label === "Other")).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toMatch(/\/api\/charts\/expenses-by-category\?year=\d+&month=\d+/);
});

test("ExpenseByCategoryPie shows error state on API failure", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network down"));

    render(<ExpenseByCategoryPie />);

    expect(await screen.findByText(/Network down/i)).toBeInTheDocument();
    expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
});

test("IncomeExpenseStackedBar refetches when year control changes", async () => {
    global.fetch
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ income: new Array(12).fill(100), expenses: new Array(12).fill(50) }),
        })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ income: new Array(12).fill(200), expenses: new Array(12).fill(60) }),
        });

    render(<IncomeExpenseStackedBar year={2026} />);

    await waitFor(() => expect(mockBarChart).toHaveBeenCalled());
    expect(global.fetch.mock.calls[0][0]).toContain("year=2026");

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Year" }));
    fireEvent.click(await screen.findByRole("option", { name: "2025" }));

    await waitFor(() => {
        expect(global.fetch.mock.calls.some((call) => String(call[0]).includes("year=2025"))).toBe(true);
    });
});

test("BankBalancesPie sorts and passes data to BarChart", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
            { name: "Checking", balance: 1500 },
            { name: "Savings", balance: 3000 },
        ],
    });

    render(<BankBalancesPie />);

    await waitFor(() => expect(mockBarChart).toHaveBeenCalled());

    const props = mockBarChart.mock.calls[mockBarChart.mock.calls.length - 1][0];
    expect(props.series[0].data[0]).toBe(3000);
    expect(props.xAxis[0].data[0]).toBe("Savings");
});

test("ExpenseBudgetHeatmap renders utilization line series from matrix API", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            categories: ["Food", "Travel"],
            values: [
                [0.1, 0.2, 0.3, 0.4, 0.2, 0.1, 0.25, 0.3, 0.5, 0.45, 0.2, 0.1],
                [0.3, 0.35, 0.4, 0.5, 0.6, 0.55, 0.4, 0.2, 0.15, 0.1, 0.2, 0.25],
            ],
        }),
    });

    render(<ExpenseBudgetHeatmap year={2026} />);

    await waitFor(() => expect(mockLineChart).toHaveBeenCalled());

    const props = mockLineChart.mock.calls[mockLineChart.mock.calls.length - 1][0];
    expect(props.series.length).toBeGreaterThan(0);
    expect(props.xAxis[0].data.length).toBe(12);
});
