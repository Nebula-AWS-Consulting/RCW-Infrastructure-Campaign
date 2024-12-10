import { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js";
import { Box, TextField, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import AppAppBar from "../views/AppAppBar";
import AppFooter from "../views/AppFooter";
import withRoot from "../withRoot";

interface OrderData {
  id: string;
  details?: Array<{
    issue: string;
    description: string;
  }>;
  debug_id?: string;
}
interface PayPalOnApproveData {
    orderID?: string;
    subscriptionID?: string | null;
    payerID?: string | null; 
  }
interface PayPalOnApproveActions {
    order?: {
        capture: () => Promise<PayPalCaptureDetails>;
    };
    }
interface PayPalCaptureDetails {
    id?: string; // Payment transaction ID
    create_time?: string; // Transaction creation time
    update_time?: string; // Transaction update time
    payer?: {
        name?: {
        given_name?: string;
        surname?: string;
        };
        email_address?: string;
        payer_id?: string;
    };
    payment_source?: {
        card?: {
        name?: string;
        last_digits?: string;
        brand?: string; // Card brand (e.g., VISA, MASTERCARD)
        type?: string; // Card type (e.g., CREDIT, DEBIT)
        };
        paypal?: {
        email_address?: string;
        };
        venmo?: {
        email_address?: string;
        account_id?: string;
        user_name?: string;
        name?: {
            given_name?: string;
            surname?: string;
            full_name?: string;
        };
        phone?: string;
        };
    };
    }

const ControPage = () => {
  const [donationAmount, setDonationAmount] = useState("10.00");
  const [paymentType, setPaymentType] = useState("one-time");
  const [customId, setCustomId] = useState("");

  const initialOptions = {
    clientId: "AV3jWo0UUa7S_pVht6SqMI9grwlpY-xRNhpgd7MisVQM4baWUSQvGSOfqqo1gExGmGPB2Drwz-fFBj8i",
    currency: "USD",
    intent: "capture",
  };

  const createOrder: PayPalButtonsComponentProps["createOrder"] = async () => {
    const endpoint =
      paymentType === "one-time"
        ? "/my-server/create-paypal-order"
        : "/my-server/create-paypal-subscription";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: donationAmount,
          customId,
        }),
      });

      const orderData: OrderData = await response.json();

      if (!orderData.id) {
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
          : "Unexpected error occurred, please try again.";

        throw new Error(errorMessage);
      }

      return orderData.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleOnApprove = (
    data: PayPalOnApproveData,
    actions: PayPalOnApproveActions,
    paymentType: "one-time" | "subscription",
    donationAmount: string
  ): Promise<void> => {
    if (paymentType === "one-time") {
      if (actions?.order?.capture) {
        return actions.order.capture().then((details) => {
          const name = details.payer?.name?.given_name || "Donor";
          alert(
            `Thank you, ${name}, for your donation of $${donationAmount}!`
          );
          console.log("Transaction Details:", details);
        });
      } else {
        return Promise.reject(new Error("Capture action is unavailable."));
      }
    } else if (paymentType === "subscription") {
      if (data.subscriptionID) {
        alert(`Thank you for subscribing! Your subscription ID is ${data.subscriptionID}`);
        console.log("Subscription Data:", data);
      } else {
        console.error("Subscription ID is null or undefined.");
      }
      return Promise.resolve();
    }
  
    return Promise.resolve();
  };
  
  

  return (
    <PayPalScriptProvider options={initialOptions}>
      <AppAppBar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <h1>Support Our Church</h1>
        <p>We appreciate your generous contributions!</p>

        {/* Donation Amount Input */}
        <TextField
          label="Donation Amount"
          type="number"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
          sx={{ margin: 2 }}
        />

        {/* Custom ID Input */}
        <TextField
          label="Custom ID"
          value={customId}
          onChange={(e) => setCustomId(e.target.value)}
          sx={{ margin: 2 }}
        />

        {/* Payment Type Selection */}
        <RadioGroup
          row
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
        >
          <FormControlLabel
            value="one-time"
            control={<Radio />}
            label="One-Time Payment"
          />
          <FormControlLabel
            value="subscription"
            control={<Radio />}
            label="Subscription"
          />
        </RadioGroup>

        {/* PayPal Buttons */}
        <PayPalButtons
            style={{ layout: "vertical", color: "silver" }}
            createOrder={createOrder}
            onApprove={(data, actions) => handleOnApprove(data, actions, paymentType as "one-time" | "subscription", donationAmount)}
            onError={(err) => {
                console.error("PayPal error:", err);
            }}
            />
      </Box>
      <AppFooter />
    </PayPalScriptProvider>
  );
};

export default withRoot(ControPage);
