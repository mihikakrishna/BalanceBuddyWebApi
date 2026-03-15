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
            .catch((e) => console.error("Failed to load categories:", e));
    }, []);

    const rows = incomes.map((i) => ({
        ...i,
        date: i.date ? new Date(i.date) : null,
        categoryId: i.category?.id ?? i.categoryId ?? 0,
        categoryName: i.category?.name || "Uncategorized",
    }));

    const handleRowUpdate = async (newRow, oldRow) => {
        try {
            const payload = {
                ...newRow,
                amount: parseFloat(newRow.amount || "0"),
                date:
                    newRow.date instanceof Date && !isNaN(newRow.date.getTime())
                        ? newRow.date.toISOString()
                        : "",
                description: newRow.description,
                categoryId: newRow.categoryId || 0,
            };
            await updateIncome(newRow.id, payload);
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
            renderCell: (params) =>
                params.row.bankIconPath ? (
                    <img
                        src={params.row.bankIconPath}
                        alt="Bank Icon"
                        style={{ height: 50, width: 50 }}
                    />
                ) : (
                    <span style={{ opacity: 0.3 }}>—</span>
                ),
        },
        { field: "date", headerName: "Date", width: 150, editable: true, type: "date" },
        {
            field: "description",
            headerName: "Description",
            width: 200,
            flex: 1,
            editable: true,
            sortable: false,
        },
        {
            field: "amount",
            headerName: "Amount",
            width: 120,
            editable: true,
        },
        {
            field: "categoryId",
            headerName: "Category",
            width: 200,
            editable: true,
            sortable: false,
            renderCell: (params) =>
                categories.find((c) => c.id === params.row.categoryId)?.name ||
                "Uncategorized",
            renderEditCell: (params) => (
                <Select
                    value={params.value || ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        params.api.setEditCellValue(
                            {
                                id: params.id,
                                field: "categoryId",
                                value: e.target.value,
                            },
                            e
                        );
                    }}
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
            renderCell: (params) => (
                <Button
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
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
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
                checkboxSelection={false}
                disableRowSelectionOnClick
                experimentalFeatures={{ newEditingApi: true }}
                processRowUpdate={handleRowUpdate}
                onProcessRowUpdateError={(e) => console.error("Update error:", e)}
                components={{ Toolbar }}
                getRowClassName={(p) => {
                    const isUnreviewed =
                        p.row.categoryName?.toLowerCase() === "unreviewed";
                    if (!isUnreviewed) return "";
                    return theme.palette.mode === "dark"
                        ? "unreviewed-row-dark"
                        : "unreviewed-row";
                }}
            />
        </Box>
    );
};

export default IncomesList;
