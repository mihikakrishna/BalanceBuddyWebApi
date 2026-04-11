import BankBalancesPie from "../charts/BankBalancesPie";
import ExpenseBudgetHeatmap from "../charts/ExpenseBudgetHeatmap";
import ExpenseByCategoryPie from "../charts/ExpenseByCategoryPie";
import IncomeExpenseStackedBar from "../charts/IncomeExpenseStackedBar";
import { Box } from "@mui/material";

function Dashboard() {
    const year = new Date().getFullYear();

    return (
        <Box sx={{ display: "grid", gap: 3 }}>
            <ExpenseByCategoryPie />
            <IncomeExpenseStackedBar year={year} />
            <BankBalancesPie />
            <ExpenseBudgetHeatmap year={year} /> 
        </Box>
    );
}

export default Dashboard;
