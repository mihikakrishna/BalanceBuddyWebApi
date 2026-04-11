import React from "react";
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Button, Box, Typography, useTheme } from "@mui/material";
import { updateCreditCard } from "../../api/creditCards";
import { undo, redo } from "../../api/undo";
import { useSnackbar } from "notistack";

const Toolbar = () => (
    <GridToolbarContainer>
        <GridToolbarQuickFilter />
        <GridToolbarExport />
    </GridToolbarContainer>
);

const isDueSoon = (value) => {
    if (!value) return false;
    const reminderDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(reminderDate.getTime())) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threshold = new Date(today);
    threshold.setDate(threshold.getDate() + 30);

    return reminderDate >= today && reminderDate <= threshold;
};

const CreditCardsList = ({ title, cards, onDelete, refreshCreditCards }) => {
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    const rows = cards.map((c) => ({
        ...c,
        openedDate: c.openedDate ? new Date(c.openedDate) : null,
        reminderDate: c.reminderDate ? new Date(c.reminderDate) : null,
        closedDate: c.closedDate ? new Date(c.closedDate) : null,
    }));

    const handleRowUpdate = async (newRow, oldRow) => {
        try {
            const payload = {
                ...newRow,
                cardName: (newRow.cardName || "").trim(),
                issuer: (newRow.issuer || "").trim(),
                last4: (newRow.last4 || "").trim() || null,
                openedDate:
                    newRow.openedDate instanceof Date &&
                    !Number.isNaN(newRow.openedDate.getTime())
                        ? newRow.openedDate.toISOString()
                        : oldRow.openedDate instanceof Date &&
                          !Number.isNaN(oldRow.openedDate.getTime())
                            ? oldRow.openedDate.toISOString()
                            : null,
                annualFee: parseFloat(newRow.annualFee || "0"),
                pointsBalance: parseInt(newRow.pointsBalance || "0", 10),
                reminderDate:
                    newRow.reminderDate instanceof Date &&
                    !Number.isNaN(newRow.reminderDate.getTime())
                        ? newRow.reminderDate.toISOString()
                        : null,
                notes: (newRow.notes || "").trim() || null,
                isClosed: !!newRow.isClosed,
                closedDate:
                    !!newRow.isClosed &&
                    newRow.closedDate instanceof Date &&
                    !Number.isNaN(newRow.closedDate.getTime())
                        ? newRow.closedDate.toISOString()
                        : null,
            };

            await updateCreditCard(newRow.id, payload);
            enqueueSnackbar("Credit card updated", { variant: "success" });
            refreshCreditCards();
            return newRow;
        } catch (err) {
            enqueueSnackbar("Update failed", { variant: "error" });
            return oldRow;
        }
    };

    const handleUndo = async () => {
        try {
            if (await undo("CreditCard")) {
                enqueueSnackbar("Undo successful", { variant: "success" });
                refreshCreditCards();
            }
        } catch {
            enqueueSnackbar("Undo failed", { variant: "error" });
        }
    };

    const handleRedo = async () => {
        try {
            if (await redo("CreditCard")) {
                enqueueSnackbar("Redo successful", { variant: "success" });
                refreshCreditCards();
            }
        } catch {
            enqueueSnackbar("Redo failed", { variant: "error" });
        }
    };

    const columns = [
        { field: "cardName", headerName: "Card", width: 190, editable: true },
        { field: "issuer", headerName: "Issuer", width: 160, editable: true },
        { field: "last4", headerName: "Last 4", width: 100, editable: true },
        {
            field: "openedDate",
            headerName: "Opened",
            width: 140,
            type: "date",
            editable: true,
        },
        {
            field: "annualFee",
            headerName: "Annual Fee",
            width: 130,
            editable: true,
            type: "number",
        },
        {
            field: "pointsBalance",
            headerName: "Points",
            width: 110,
            editable: true,
            type: "number",
        },
        {
            field: "reminderDate",
            headerName: "Reminder",
            width: 140,
            type: "date",
            editable: true,
        },
        {
            field: "notes",
            headerName: "Notes",
            flex: 1,
            minWidth: 180,
            editable: true,
            sortable: false,
        },
        {
            field: "isClosed",
            headerName: "Closed",
            width: 100,
            editable: true,
            type: "boolean",
        },
        {
            field: "closedDate",
            headerName: "Closed Date",
            width: 140,
            type: "date",
            editable: true,
        },
        {
            field: "action",
            headerName: "Action",
            width: 120,
            sortable: false,
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
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
                {title}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                <Button onClick={handleUndo} variant="outlined">
                    Undo
                </Button>
                <Button onClick={handleRedo} variant="outlined">
                    Redo
                </Button>
            </Box>
            <Box sx={{ height: 460, width: "100%" }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(r) => r.id}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10]}
                    disableRowSelectionOnClick
                    experimentalFeatures={{ newEditingApi: true }}
                    processRowUpdate={handleRowUpdate}
                    onProcessRowUpdateError={(e) => console.error("Update error:", e)}
                    components={{ Toolbar }}
                    getRowClassName={(p) => (isDueSoon(p.row.reminderDate) ? "due-soon-row" : "")}
                    sx={{
                        "& .due-soon-row": {
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 193, 7, 0.14)"
                                    : "rgba(255, 213, 79, 0.24)",
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default CreditCardsList;
