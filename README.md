# **Overview of the RCW Infrastructure Application**

*For more info visit src/client-frontend/README.md and src/server/README.md*

The RCW Infrastructure Application is a **church-focused** web platform that brings together **user account management**, **donations**, and **communication** features in a single streamlined experience. It comprises two main components:

1. **Front-End (React + Redux):**  
   - **User Interface & Routing:** Built with React and React Router for intuitive navigation. Users can sign up, log in, reset their passwords, and view or update their profiles.  
   - **State Management:** A Redux slice (`userAuthAndInfoSlice`) holds essential user data (email, username) and token information for authentication. This allows the app to restore user sessions on refresh, keeping them logged in if they have valid credentials in local storage.  
   - **PayPal Integration:** Dedicated components manage one-time payments (`OneTimePaymentComponent`) and recurring subscriptions (`SubscriptionPaymentComponent`). These pages call the backend to create PayPal orders or subscriptions, then handle approvals and error messages directly in the client. A “thank you” banner is displayed upon successful donation.  
   - **Contact & Location:** Environment variables (e.g., `VITE_CONTACT_EMAIL`, `VITE_GOOGLE_MAP_IMBED`) configure contact details, addresses, and times for events or services, making it easy to update text without redeploying.  

2. **Back-End (AWS Lambda & Cognito):**  
   - **Authentication & User Pool:** Powered by AWS Cognito. Endpoints allow new users to sign up, confirm their email addresses, and sign in, returning JWT tokens. A password-reset flow is also available for users who have forgotten their credentials.  
   - **User Management:** The API provides user profile updates, deletion, and attribute modifications (e.g., updating passwords).  
   - **Donations with PayPal:** The server exposes routes to create PayPal orders for one-time giving or recurring subscriptions, securely obtaining and managing PayPal tokens. Upon success, it returns the PayPal order/subscription ID to the front-end to finalize the user experience.  
   - **Email Handling (AWS SES):** A “Contact Us” endpoint uses AWS SES to send messages from website visitors directly to a designated church email.  
   - **CORS & Security:** Configured to allow secure cross-origin requests from the React front-end, while protecting API resources behind Cognito authentication where needed.  

Overall, the RCW Infrastructure Application streamlines **church operations** by centralizing member sign-up, profile management, donations (one-time and recurring), and contact inquiries. Its **React front-end** manages a user-friendly interface and session persistence, while the **AWS-based server** ensures reliable authentication, secure donation handling, and communication via email—all under a consistent domain and environment variable–driven setup.