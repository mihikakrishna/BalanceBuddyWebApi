import BankBalancesPie from "../charts/BankBalancesPie";
import ExpenseBudgetHeatmap from "../charts/ExpenseBudgetHeatmap";
import ExpenseByCategoryPie from "../charts/ExpenseByCategoryPie";
import IncomeExpenseStackedBar from "../charts/IncomeExpenseStackedBar";
import { Box } from "@mui/material";

function Dashboard() {
    const year = new Date().getFullYear();
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = prev.toISOString().slice(0, 7);

    return (
        <Box sx={{ display: "grid", gap: 3 }}>
            <ExpenseByCategoryPie month={month} />
            <IncomeExpenseStackedBar year={year} />
            <BankBalancesPie />
            <ExpenseBudgetHeatmap year={year} /> 
        </Box>
    );
}

export default Dashboard;
