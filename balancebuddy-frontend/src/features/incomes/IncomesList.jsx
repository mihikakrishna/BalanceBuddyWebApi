/// <reference path="../expenses/expenseslist.jsx" />
import React, { useEffect, useState } from "react";
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Button, Typography, Box, Select, MenuItem } from "@mui/material";
import { updateIncome } from "../../api/incomes";
import { fetchCategories } from "../../api/incomeCategory";
import { undo, redo } from "../../api/undo";
import { useSnackbar } from "notistack";

const Toolbar = () => (
    <GridToolbarContainer>
        <GridToolbarQuickFilter />
        <GridToolbarExport />
    </GridToolbarContainer>
);

const IncomesList = ({ incomes, onDelete, refreshIncomes }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [categories, setCategories] = useState([]);

    /* ---------- categories ---------- */
    useEffect(() => {
        fetchCategories()
            .then(setCategories)
            .catch((e) => console.error("load income cats:", e));
    }, []);

    /* ---------- rows ---------- */
    const rows = incomes.map((i) => ({
        ...i,
        date: i.date ? new Date(i.date) : null,
        categoryId: i.categoryId || i.category?.id || 0,
        categoryName: i.category?.name || "Uncategorized",
    }));

    /* ---------- inline edit ---------- */
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
        } catch (e) {
            enqueueSnackbar("Update failed", { variant: "error" });
            return oldRow;
        }
    };

    /* ---------- undo/redo ---------- */
    const handleUndo = async () => {
        try {
            const success = await undo("Income");
            if (success) {
                enqueueSnackbar("Undo successful", { variant: "success" });
                refreshIncomes();
            }
        } catch (err) {
            enqueueSnackbar("Undo failed", { variant: "error" });
        }
    };

    const handleRedo = async () => {
        try {
            const success = await redo("Income");
            if (success) {
                enqueueSnackbar("Redo successful", { variant: "success" });
                refreshIncomes();
            }
        } catch (err) {
            enqueueSnackbar("Redo failed", { variant: "error" });
        }
    };

    /* ---------- columns ---------- */
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
        { field: "date", headerName: "Date", width: 150, type: "date", editable: true },
        { field: "description", headerName: "Description", width: 200, editable: true },
        { field: "amount", headerName: "Amount", width: 120, editable: true },
        {
            field: "categoryId",
            headerName: "Category",
            width: 200,
            editable: true,
            renderCell: (p) => {
                const sel = categories.find((c) => c.id === p.row.categoryId);
                return sel ? sel.name : "Uncategorized";
            },
            renderEditCell: (p) => (
                <Select
                    value={p.value || ""}
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
            renderCell: (p) => (
                <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => onDelete(p.row.id)}
                >
                    Delete
                </Button>
            ),
        },
    ];

    /* ---------- UI ---------- */
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
                getRowId={(r) => r.id}
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                checkboxSelection
                disableSelectionOnClick
                processRowUpdate={handleRowUpdate}
                onProcessRowUpdateError={(e) => console.error("DG update:", e)}
                experimentalFeatures={{ newEditingApi: true }}
                components={{ Toolbar }}
            />
        </Box>
    );
};

export default IncomesList;
