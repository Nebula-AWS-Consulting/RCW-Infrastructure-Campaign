import { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js";
import { Box, TextField, RadioGroup, FormControlLabel, Radio, InputAdornment } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AppAppBar from "../views/AppAppBar";
import AppFooter from "../views/AppFooter";
import withRoot from "../withRoot";
import AppForm from "../views/AppForm";
import Typography from "../components/Typography";

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
    id?: string;
    create_time?: string;
    update_time?: string;
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
        brand?: string;
        type?: string;
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
  const [donationAmount, setDonationAmount] = useState("0.00");
  const [paymentType, setPaymentType] = useState("one-time");

  const initialOptions = {
    clientId: "AfYXn-9V-9VfmWexdtRa8Q6ZYBQ4eU8cW8J01x4_BfCMuEuHN3kOc1eP9V-VYjYcqktNR06NuSr-UqT9",
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
          customId: "Contribution"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

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

  const handleOnApprove = async (
    data: PayPalOnApproveData,
    actions: PayPalOnApproveActions,
    paymentType: "one-time" | "subscription",
    donationAmount: string
  ): Promise<void> => {
    if (paymentType === "one-time") {
      if (actions?.order?.capture) {
        const details = await actions.order.capture();
          const name = details.payer?.name?.given_name || "Donor";
          alert(
              `Thank you, ${name}, for your donation of $${donationAmount}!`
          );
          console.log("Transaction Details:", details);
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
      <AppForm>
        <Typography variant="h5" align="center" mb={2} justifySelf={'center'}>Donate to</Typography>
        <Typography variant="h4" gutterBottom marked="center" align="center">Restored Church Las Vegas</Typography>
        <Typography variant="h5" align="center" my={3} width={'80%'} justifySelf={'center'}>Weekly Contribution</Typography>

        {/* Donation Amount Input */}
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
        }}>
            <TextField
                label="Donation Amount"
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                sx={{ margin: 2, justifySelf: 'center' }}
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <AttachMoneyIcon />
                    </InputAdornment>
                    ),
                }}
                />
        </Box>

        {/* Payment Type Selection */}   
        <RadioGroup
          row
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          sx={{ marginBottom: '3rem', justifySelf: 'center'}}
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
            style={{ layout: "vertical", color: "black" }}
            createOrder={createOrder}
            onApprove={(data, actions) => handleOnApprove(data, actions, paymentType as "one-time" | "subscription", donationAmount)}
            onError={(err) => {
                console.error("PayPal error:", err);
            }}
            />
      </AppForm>
      <AppFooter />
    </PayPalScriptProvider>
  );
};

export default withRoot(ControPage);
