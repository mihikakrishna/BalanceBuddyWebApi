import React, { useEffect, useState } from "react";
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Button, Box, Select, MenuItem, useTheme } from "@mui/material";
import { updateIncome } from "../../api/incomes";
import { fetchIncomeCategories } from "../../api/incomeCategory";
import { undo, redo } from "../../api/undo";
import { useSnackbar } from "notistack";
import "../../App.css";

const Toolbar = () => (
    <GridToolbarContainer>
        <GridToolbarQuickFilter />
        <GridToolbarExport />
    </GridToolbarContainer>
);

const IncomesList = ({ incomes, onDelete, refreshIncomes }) => {
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchIncomeCategories()
            .then(setCategories)
            .catch((e) => console.error("load income cats:", e));
    }, []);

    const rows = incomes.map((i) => ({
        ...i,
        date: i.date ? new Date(i.date) : null,
        categoryId: i.category?.id ?? i.categoryId ?? 0,
        categoryName: i.category?.name || "Uncategorized",
    }));

    const handleRowUpdate = async (newRow, oldRow) => {
        try {
            await updateIncome(newRow.id, {
                ...newRow,
                amount: parseFloat(newRow.amount || "0"),
                date:
                    newRow.date instanceof Date && !isNaN(newRow.date)
                        ? newRow.date.toISOString()
                        : "",
            });
            enqueueSnackbar("Income updated", { variant: "success" });
            refreshIncomes();
            return newRow;
        } catch (err) {
            enqueueSnackbar("Update failed", { variant: "error" });
            return oldRow;
        }
    };

    const handleUndo = async () => {
        try {
            if (await undo("Income")) {
                enqueueSnackbar("Undo successful", { variant: "success" });
                refreshIncomes();
            }
        } catch {
            enqueueSnackbar("Undo failed", { variant: "error" });
        }
    };

    const handleRedo = async () => {
        try {
            if (await redo("Income")) {
                enqueueSnackbar("Redo successful", { variant: "success" });
                refreshIncomes();
            }
        } catch {
            enqueueSnackbar("Redo failed", { variant: "error" });
        }
    };

    const columns = [
        {
            field: "bankIconPath",
            headerName: "Bank",
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: ({ value }) =>
                value ? (
                    <img src={value} alt="Bank" style={{ width: 50, height: 50 }} />
                ) : (
                    <span style={{ opacity: 0.3 }}>—</span>
                ),
        },
        { field: "date", headerName: "Date", width: 150, type: "date", editable: true },
        { field: "description", headerName: "Description", width: 220, flex: 1, editable: true },
        { field: "amount", headerName: "Amount", width: 120, type: "number", editable: true },
        {
            field: "categoryId",
            headerName: "Category",
            width: 200,
            editable: true,
            renderCell: (p) =>
                categories.find((c) => c.id === p.row.categoryId)?.name ?? "Uncategorized",
            renderEditCell: (p) => (
                <Select
                    value={p.value ?? ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                        p.api.setEditCellValue(
                            { id: p.id, field: "categoryId", value: e.target.value },
                            e
                        )
                    }
                    fullWidth
                >
                    {categories.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                            {c.name}
                        </MenuItem>
                    ))}
                </Select>
            ),
        },
        {
            field: "action",
            headerName: "Action",
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (p) => (
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(p.row.id);
                    }}
                >
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <Box sx={{ height: 600, width: "100%" }}>
            <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
                <Button onClick={handleUndo} variant="outlined">
                    Undo
                </Button>
                <Button onClick={handleRedo} variant="outlined">
                    Redo
                </Button>
            </Box>
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(r) => r.id}
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                checkboxSelection
                disableSelectionOnClick
                processRowUpdate={handleRowUpdate}
                onProcessRowUpdateError={(e) => console.error("update:", e)}
                components={{ Toolbar }}
                getRowClassName={(p) => {
                    const isUnreviewed =
                        p.row.categoryName?.toLowerCase() === "unreviewed";
                    if (!isUnreviewed) return "";
                    return theme.palette.mode === "dark"
                        ? "unreviewed-row-dark"
                        : "unreviewed-row";
                }}
                slotProps={{
                    panel: {
                        sx: (theme) => ({
                            ...(theme.palette.mode === "light" && {
                                backgroundColor: "#ffffff",
                                color: "#000000",
                            }),
                            ...(theme.palette.mode === "dark" && {
                                backgroundColor: "#1e1e1e",
                                color: "#f0f0f0",
                            }),
                            border: "1px solid rgba(255,255,255,0.15)",
                            boxShadow: "0px 4px 12px rgba(0,0,0,0.8)",
                        }),
                    },
                }}
            />

        </Box>
    );
};

export default IncomesList;
