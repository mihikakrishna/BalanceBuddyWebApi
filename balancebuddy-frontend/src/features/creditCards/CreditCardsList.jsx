import React, { useState } from "react";
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
    Button,
    Box,
    Typography,
    useTheme,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { updateCreditCard } from "../../api/creditCards";
import { undo, redo } from "../../api/undo";
import { useSnackbar } from "notistack";

const Toolbar = () => (
    <GridToolbarContainer>
        <GridToolbarQuickFilter />
        <GridToolbarExport />
    </GridToolbarContainer>
);

const getReminderWarning = (value) => {
    if (!value) return null;
    const reminderDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(reminderDate.getTime())) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reminderDay = new Date(
        reminderDate.getFullYear(),
        reminderDate.getMonth(),
        reminderDate.getDate()
    );
    const threshold = new Date(today);
    threshold.setDate(threshold.getDate() + 30);
    const days = Math.ceil((reminderDay - today) / (1000 * 60 * 60 * 24));
    const dateLabel = reminderDay.toLocaleDateString();

    if (reminderDay < today) {
        return `Reminder date passed on ${dateLabel}. Update this card reminder.`;
    }

    if (reminderDay <= threshold) {
        if (days === 0) return `Reminder is due today (${dateLabel}).`;
        if (days === 1) return `Reminder is due tomorrow (${dateLabel}).`;
        return `Reminder is due in ${days} days (${dateLabel}).`;
    }

    return null;
};

const toIsoOrNull = (value) => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
    return value.toISOString();
};

const buildPayload = (row, overrides = {}) => {
    const payload = {
        ...row,
        cardName: (row.cardName || "").trim(),
        issuer: (row.issuer || "").trim(),
        last4: (row.last4 || "").trim() || null,
        openedDate: toIsoOrNull(row.openedDate),
        annualFee: parseFloat(row.annualFee || "0"),
        pointsBalance: parseInt(row.pointsBalance || "0", 10),
        reminderDate: toIsoOrNull(row.reminderDate),
        notes: (row.notes || "").trim() || null,
        isClosed: !!row.isClosed,
        closedDate: !!row.isClosed ? toIsoOrNull(row.closedDate) : null,
    };

    return {
        ...payload,
        ...overrides,
    };
};

const CreditCardsList = ({ title, cards, onDelete, refreshCreditCards, listType }) => {
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const [actionAnchorEl, setActionAnchorEl] = useState(null);
    const [actionRow, setActionRow] = useState(null);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [closeDateInput, setCloseDateInput] = useState("");
    const [closeDateError, setCloseDateError] = useState("");

    const rows = cards.map((c) => ({
        ...c,
        openedDate: c.openedDate ? new Date(c.openedDate) : null,
        reminderDate: c.reminderDate ? new Date(c.reminderDate) : null,
        closedDate: c.closedDate ? new Date(c.closedDate) : null,
    }));

    const handleRowUpdate = async (newRow, oldRow) => {
        try {
            const payload = buildPayload(newRow, {
                openedDate: toIsoOrNull(newRow.openedDate) ?? toIsoOrNull(oldRow.openedDate),
            });

            await updateCreditCard(newRow.id, payload);
            enqueueSnackbar("Credit card updated", { variant: "success" });
            refreshCreditCards();
            return newRow;
        } catch (err) {
            enqueueSnackbar("Update failed", { variant: "error" });
            return oldRow;
        }
    };

    const openActionsMenu = (event, row) => {
        event.stopPropagation();
        setActionAnchorEl(event.currentTarget);
        setActionRow(row);
    };

    const closeActionsMenu = () => {
        setActionAnchorEl(null);
    };

    const openCloseDateDialog = () => {
        closeActionsMenu();
        setCloseDateInput("");
        setCloseDateError("");
        setCloseDialogOpen(true);
    };

    const closeCloseDateDialog = () => {
        setCloseDialogOpen(false);
        setCloseDateInput("");
        setCloseDateError("");
    };

    const handleSetClosed = async () => {
        if (!actionRow) return;
        if (!closeDateInput) {
            setCloseDateError("Please select a close date.");
            return;
        }

        try {
            const closeDate = new Date(`${closeDateInput}T12:00:00`);
            const payload = buildPayload(actionRow, {
                isClosed: true,
                closedDate: closeDate.toISOString(),
            });
            await updateCreditCard(actionRow.id, payload);
            enqueueSnackbar("Card closed", { variant: "success" });
            closeCloseDateDialog();
            setActionRow(null);
            refreshCreditCards();
        } catch {
            enqueueSnackbar("Failed to close card", { variant: "error" });
        }
    };

    const handleSetOpen = async () => {
        if (!actionRow) return;
        closeActionsMenu();
        try {
            const payload = buildPayload(actionRow, {
                isClosed: false,
                closedDate: null,
            });
            await updateCreditCard(actionRow.id, payload);
            enqueueSnackbar("Card reopened", { variant: "success" });
            setActionRow(null);
            refreshCreditCards();
        } catch {
            enqueueSnackbar("Failed to reopen card", { variant: "error" });
        }
    };

    const handleDeleteFromMenu = async () => {
        if (!actionRow) return;
        closeActionsMenu();
        await onDelete(actionRow.id);
        setActionRow(null);
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
        {
            field: "warning",
            headerName: "Warning",
            width: 96,
            sortable: false,
            filterable: false,
            editable: false,
            renderCell: (params) => {
                const warningMessage = getReminderWarning(params.row.reminderDate);
                if (!warningMessage) return null;

                return (
                    <Tooltip title={warningMessage} arrow>
                        <WarningAmberIcon color="error" fontSize="small" />
                    </Tooltip>
                );
            },
        },
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
        ...(listType === "closed"
            ? [
                {
                    field: "closedDate",
                    headerName: "Closed Date",
                    width: 140,
                    type: "date",
                    editable: true,
                },
            ]
            : []),
        {
            field: "actions",
            headerName: "Actions",
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                        openActionsMenu(e, params.row);
                    }}
                >
                    Actions
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
                    getRowClassName={(p) =>
                        getReminderWarning(p.row.reminderDate) ? "warning-row" : ""
                    }
                    sx={{
                        "& .warning-row": {
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(244, 67, 54, 0.18)"
                                    : "rgba(244, 67, 54, 0.14)",
                        },
                    }}
                />
            </Box>
            <Menu anchorEl={actionAnchorEl} open={!!actionAnchorEl} onClose={closeActionsMenu}>
                <MenuItem onClick={handleDeleteFromMenu}>Delete</MenuItem>
                {listType === "open" ? (
                    <MenuItem onClick={openCloseDateDialog}>Close Card</MenuItem>
                ) : (
                    <MenuItem onClick={handleSetOpen}>Open Card</MenuItem>
                )}
            </Menu>
            <Dialog open={closeDialogOpen} onClose={closeCloseDateDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Select Close Date</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Close Date"
                        type="date"
                        value={closeDateInput}
                        onChange={(e) => {
                            setCloseDateInput(e.target.value);
                            if (e.target.value) setCloseDateError("");
                        }}
                        required
                        fullWidth
                        margin="dense"
                        error={!!closeDateError}
                        helperText={closeDateError}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeCloseDateDialog}>Cancel</Button>
                    <Button onClick={handleSetClosed} variant="contained">
                        Close Card
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CreditCardsList;
