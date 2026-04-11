import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import {
    fetchCreditCards,
    createCreditCard,
    deleteCreditCard,
} from "../api/creditCards";
import CreditCardForm from "../features/creditCards/CreditCardForm";
import CreditCardsList from "../features/creditCards/CreditCardsList";
import CreditCardAnnualFeeChart from "../features/creditCards/CreditCardAnnualFeeChart";

const CreditCardsPage = () => {
    const [creditCards, setCreditCards] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadCreditCards = async () => {
        try {
            const data = await fetchCreditCards();
            setCreditCards(data);
        } catch (err) {
            console.error("Failed to load credit cards", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (newCard) => {
        await createCreditCard(newCard);
        await loadCreditCards();
    };

    const handleDelete = async (id) => {
        await deleteCreditCard(id);
        await loadCreditCards();
    };

    useEffect(() => {
        loadCreditCards();
    }, []);

    const openCards = creditCards.filter((c) => !c.isClosed);
    const closedCards = creditCards.filter((c) => c.isClosed);

    return (
        <div>
            <CreditCardForm onSubmit={handleCreate} />
            <Box sx={{ mt: 4 }}>
                <CreditCardAnnualFeeChart cards={creditCards} />
            </Box>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <CreditCardsList
                        title="Open Cards"
                        cards={openCards}
                        onDelete={handleDelete}
                        refreshCreditCards={loadCreditCards}
                        listType="open"
                    />
                    <CreditCardsList
                        title="Closed Cards"
                        cards={closedCards}
                        onDelete={handleDelete}
                        refreshCreditCards={loadCreditCards}
                        listType="closed"
                    />
                </>
            )}
        </div>
    );
};

export default CreditCardsPage;
