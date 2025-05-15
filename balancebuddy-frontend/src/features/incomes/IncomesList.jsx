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

const CustomToolbar = () => (
    <GridToolbarContainer>
        <GridToolbarQuickFilter />
        <GridToolbarExport />
    </GridToolbarContainer>
);

const IncomesList = ({ incomes, onDelete }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        loadCategories();
    }, []);

    const rows = incomes.map((exp) => ({
        ...exp,
        date: exp.date ? new Date(exp.date) : null,
        incomeCategoryId: exp.incomeCategoryId || exp.category?.id || 0,
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
                incomeCategoryId: updatedRow.incomeCategoryId || 0,
            };

            await updateIncome(updatedRow.id, updatedPayload);
            return updatedRow;
        } catch (err) {
            console.error("Failed to update row:", err);
            return oldRow;
        }
    };

    const columns = [
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
            field: "incomeCategoryId",
            headerName: "Category",
            width: 200,
            editable: true,
            renderCell: (params) => {
                const selected = categories.find(
                    (c) => c.id === params.row.incomeCategoryId
                );
                return selected ? selected.name : "Uncategorized";
            },
            renderEditCell: (params) => (
                <Select
                    value={params.value || ""}
                    onChange={(e) => {
                        params.api.setEditCellValue({
                            id: params.id,
                            field: "incomeCategoryId",
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
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onDelete(params.row.id)}
                >
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <Box sx={{ height: 600, width: "100%" }}>
            <Typography variant="h6" gutterBottom>
                All Incomes
            </Typography>
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
            />
        </Box>
    );
};

export default IncomesList;
