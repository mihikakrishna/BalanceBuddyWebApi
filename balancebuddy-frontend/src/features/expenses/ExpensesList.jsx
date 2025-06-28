import React, { useEffect, useState } from "react";
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Button, Typography, Box, Select, MenuItem } from "@mui/material";
import { updateExpense } from "../../api/expenses";
import { fetchExpenseCategories } from "../../api/expenseCategory";
import { undo, redo } from "../../api/undo";
import { useSnackbar } from "notistack";
import '../../App.css';


const CustomToolbar = () => (
    <GridToolbarContainer>
        <GridToolbarQuickFilter />
        <GridToolbarExport />
    </GridToolbarContainer>
);

const ExpensesList = ({ expenses, onDelete, refreshExpenses }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchExpenseCategories();
                setCategories(data);
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        loadCategories();
    }, []);

    const rows = expenses.map((exp) => ({
        ...exp,
        date: exp.date ? new Date(exp.date) : null,
        expenseCategoryId: exp.expenseCategoryId || exp.category?.id || 0,
        categoryName: exp.category?.name || "Uncategorized",
    }));

    const handleRowUpdate = async (updatedRow, oldRow) => {
        try {
            const updatedPayload = {
                ...updatedRow,
                amount: parseFloat(updatedRow.amount || "0"),
                date:
                    updatedRow.date instanceof Date && !isNaN(updatedRow.date.getTime())
                        ? updatedRow.date.toISOString()
                        : "",
                description: updatedRow.description,
                categoryId: updatedRow.expenseCategoryId || 0,
            };

            await updateExpense(updatedRow.id, updatedPayload);
            enqueueSnackbar("Expense updated", { variant: "success" });
            refreshExpenses();
            return updatedRow;
        } catch (err) {
            console.error("Failed to update row:", err);
            enqueueSnackbar("Failed to update expense", { variant: "error" });
            return oldRow;
        }
    };

    const handleUndo = async () => {
        try {
            const success = await undo("Expense");
            if (success) {
                enqueueSnackbar("Undo successful", { variant: "success" });
                refreshExpenses();
            }
        } catch (err) {
            enqueueSnackbar("Undo failed", { variant: "error" });
        }
    };

    const handleRedo = async () => {
        try {
            const success = await redo("Expense");
            if (success) {
                enqueueSnackbar("Redo successful", { variant: "success" });
                refreshExpenses();
            }
        } catch (err) {
            enqueueSnackbar("Redo failed", { variant: "error" });
        }
    };

    const columns = [
        {
            field: "bankIconPath",
            headerName: "Bank",
            width: 80,
            renderCell: (params) => {
                const iconPath = params.row.bankIconPath;
                return iconPath ? (
                    <img src={iconPath} alt="Bank Icon" style={{ height: 50, width: 50 }} />
                ) : (
                    <span style={{ opacity: 0.3 }}>—</span> // or fallback icon
                );
            }
        },
        {
            field: "date",
            headerName: "Date",
            width: 150,
            editable: true,
            type: "date",
        },
        {
            field: "description",
            headerName: "Description",
            width: 200,
            editable: true,
        },
        {
            field: "amount",
            headerName: "Amount",
            width: 120,
            editable: true,
        },
        {
            field: "expenseCategoryId",
            headerName: "Category",
            width: 200,
            editable: true,
            renderCell: (params) => {
                const selected = categories.find(
                    (c) => c.id === params.row.expenseCategoryId
                );
                return selected ? selected.name : "Uncategorized";
            },
            renderEditCell: (params) => (
                <Select
                    value={params.value || ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        params.api.setEditCellValue({
                            id: params.id,
                            field: "expenseCategoryId",
                            value: e.target.value,
                        }, e);
                    }}
                    fullWidth
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </Select>
            ),
        },
        {
            field: "action",
            headerName: "Action",
            width: 120,
            renderCell: (params) => (
                <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(params.row.id);
                    }}
                >
                    Delete
                </Button>
            ),
        },

    ];

    return (
        <Box sx={{ height: 600, width: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "right", mb: 2 }}>
                <Box>
                    <Button onClick={handleUndo} sx={{ mr: 1 }} variant="outlined">
                        Undo
                    </Button>
                    <Button onClick={handleRedo} variant="outlined">
                        Redo
                    </Button>
                </Box>
            </Box>
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.id}
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                checkboxSelection
                disableSelectionOnClick
                processRowUpdate={handleRowUpdate}
                onProcessRowUpdateError={(error) =>
                    console.error("Update error:", error)
                }
                experimentalFeatures={{ newEditingApi: true }}
                components={{ Toolbar: CustomToolbar }}
                getRowClassName={(params) =>
                    params.row.categoryName?.toLowerCase() === "unreviewed"
                        ? "unreviewed-row"
                        : ""
                }
            />
        </Box>
    );
};

export default ExpensesList;
