
# **RCW Client Backend API Documentation**

## **a. Introduction**

**Description:**  
The RCW Client Backend API provides user authentication (sign-up, login, password reset), user management (update, delete), and donation-related functionality (PayPal order creation, subscription setup). It leverages **AWS Cognito** for user management and **PayPal’s REST API** for payment processing. Additionally, it includes a simple “Contact Us” endpoint that uses **AWS SES** to send emails.

**Base URL (Example):**  
```
https://lkhnk9mouh.execute-api.us-west-1.amazonaws.com/prod
```
*(May change on a frequent rate)*

**Deployment**
The server code is used by a Lambda function that is created using a CloudFormation template file that references an S3 bucket. Run this command in the /server directory:
```
../bin/upload-server.sh
```


**Typical Use Cases:**
- User account creation, email verification, and login  
- Updating user attributes (name, password, etc.)  
- Integrating PayPal for one-time donations or subscriptions  
- Contact form submissions to your church’s email via SES  

---

## **b. Authentication**

### **Cognito Authentication**
This API uses AWS Cognito for authentication. Users obtain tokens by calling the **`/login`** endpoint. Some endpoints (e.g., `confirm-email`, `confirm-email-resend`) expect an **`access_token`** in the request **body** rather than a traditional `Authorization` header.

However, be aware that in a production scenario, you might secure certain endpoints with standard Bearer tokens in headers. In this codebase, tokens are generally passed through the **request body** instead. Make sure your front end or client application knows how to provide these tokens to protected endpoints.

**Steps to Obtain Cognito Credentials:**
1. **Sign Up**: Use `/signup` to create a new user account.  
2. **Confirm User**: If needed, confirm user sign-up with `/confirm` or use email-verification endpoints (`/confirm-email`) if your pool is set up that way.  
3. **Log In**: Call `/login` to receive an **IdToken**, **AccessToken**, and **RefreshToken**.

**Example Token Usage (From the Body):**
```json
{
  "access_token": "your_cognito_access_token",
  "confirmation_code": "123456"
}
```

> **Note**: This is different from typical `Authorization: Bearer ...` headers. For this API, follow exactly what each endpoint’s documentation states.

---

## **c. Endpoint References**

Below are the main endpoints, grouped by functionality. Each entry details the **method**, **path**, **request body (if applicable)**, **query parameters**, **response**, and **example** usage.

---

### **1. User Registration & Confirmation**

#### **POST** `/signup`
**Description**: Registers a new user in Cognito.  
**Request Body** (JSON):
```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!",
  "first_name": "John",
  "last_name": "Doe"
}
```
- **email** *(required)*: The new user’s email  
- **password** *(required)*: The desired password  
- **first_name** *(required)*  
- **last_name** *(required)*  

**Response**:
```json
{
  "message": "User signed up successfully"
}
```
- **HTTP 200**: User creation succeeded.  
- **HTTP 400 / 409**: Various signup errors (e.g., “User already exists”).  
- **HTTP 500**: Internal error.

---

#### **POST** `/confirm`
**Description**: Confirms a user in Cognito (marks them as verified). Typically used if your user pool is set to require admin confirmation.  
**Request Body** (JSON):
```json
{
  "email": "user@example.com"
}
```
- **email** *(required)*: The user’s email to confirm  

**Response**:
```json
{
  "message": "User confirmed successfully"
}
```
- **HTTP 200**: Confirmation succeeded.  
- **HTTP 404**: User not found.  
- **HTTP 403**: Not authorized to confirm the user.  

---

#### **POST** `/confirm-email`
**Description**: Verifies a user’s email attribute by confirming the **`confirmation_code`**.  
**Request Body** (JSON):
```json
{
  "access_token": "ACCESS_TOKEN_FROM_LOGIN",
  "confirmation_code": "123456"
}
```
- **access_token** *(required)*: The valid Cognito Access Token from `/login`.  
- **confirmation_code** *(required)*: The code emailed to the user.  

**Response**:
```json
{
  "message": "Email confirmed successfully."
}
```
- **HTTP 200**: Email verified.  
- **HTTP 400**: Incorrect or expired code.  
- **HTTP 403**: Unauthorized.

---

#### **POST** `/confirm-email-resend`
**Description**: Resends the email verification code to the user’s email address.  
**Request Body** (JSON):
```json
{
  "access_token": "ACCESS_TOKEN_FROM_LOGIN"
}
```
- **access_token** *(required)*  

**Response**:
```json
{
  "message": "Verification code sent successfully."
}
```
- **HTTP 200**: Code sent.  
- **HTTP 404**: User not found.  
- **HTTP 403**: Not authorized.

---

### **2. Login & Password Management**

#### **POST** `/login`
**Description**: Authenticates the user with Cognito, returning tokens if successful.  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}
```
- **email** *(required)*  
- **password** *(required)*  

**Response**:
```json
{
  "message": "User logged in successfully",
  "user_id": "cognito-user-sub-id",
  "id_token": "xxxxx.yyyyy.zzzzz",
  "access_token": "xxxxx.yyyyy.zzzzz",
  "refresh_token": "xxxxx..."
}
```
- **HTTP 200**: Contains Cognito tokens.  
- **HTTP 401**: Invalid email or password.  
- **HTTP 404**: User not found.

---

#### **POST** `/forgot-password`
**Description**: Initiates password reset flow by sending a code to the user’s email.  
**Request Body**:
```json
{
  "email": "user@example.com"
}
```
- **email** *(required)*  

**Response**:
```json
{
  "message": "Password reset initiated. Check your email for the code."
}
```
- **HTTP 200**: Email with reset code sent.  
- **HTTP 404**: User not found.  
- **HTTP 429**: Too many attempts.  

---

#### **POST** `/confirm-forgot-password`
**Description**: Completes the password reset by providing the code and new password.  
**Request Body**:
```json
{
  "email": "user@example.com",
  "confirmation_code": "123456",
  "new_password": "N3wP@ssw0rd!"
}
```
- **email** *(required)*  
- **confirmation_code** *(required)*  
- **new_password** *(required)*  

**Response**:
```json
{
  "message": "Password reset successfully."
}
```
- **HTTP 200**: Password changed.  
- **HTTP 400**: Incorrect or expired code, or invalid password.  
- **HTTP 404**: User not found.

---

### **3. User Management**

#### **GET** `/user`
**Description**: Retrieves a user’s data (attributes, email verification status).  
**Query Parameter**:
```
?email=user@example.com
```
- **email** *(required)*  

**Response**:
```json
{
  "message": "User data retrieved successfully",
  "user_attributes": {
    "email": "user@example.com",
    "custom:firstName": "John",
    "custom:lastName": "Doe",
    "email_verified": "true"
  },
  "email_verified": true
}
```
- **HTTP 200**: Returns user data.  
- **HTTP 400**: Missing email param.  
- **HTTP 404**: User not found.

---

#### **PATCH** `/user`
**Description**: Updates user attributes in Cognito. Also supports changing the user’s password if `password` is provided in **attribute_updates**.  
**Request Body**:
```json
{
  "email": "user@example.com",
  "attribute_updates": {
    "password": "N3wP@ssw0rd!", // optional - triggers a password change
    "custom:firstName": "Johnathan"
  }
}
```
- **email** *(required)*  
- **attribute_updates** *(required)*: A dictionary of attributes to update.  
   - If **password** is included, the user’s password is set via `admin_set_user_password`.  

**Response**:
```json
{
  "message": "User attributes updated successfully"
}
```
- **HTTP 200**: Attributes updated.  
- **HTTP 400**: Missing or invalid parameters.  
- **HTTP 404**: User not found.

---

#### **DELETE** `/user`
**Description**: Deletes a user from Cognito.  
**Request Body**:
```json
{
  "email": "user@example.com"
}
```
- **email** *(required)*  

**Response**:
```json
{
  "message": "User deleted successfully"
}
```
- **HTTP 200**: User deleted.  
- **HTTP 404**: User not found.  
- **HTTP 403**: Not authorized (if such a policy is in place).

---

### **4. Contact Form**

#### **POST** `/contact-us`
**Description**: Sends an email (via AWS SES) with the user’s message to the church’s email.  
**Request Body**:
```json
{
  "first_name": "John",
  "email": "john@example.com",
  "message": "Hello, I have a question about your Sunday services."
}
```
- **first_name** *(required)*  
- **email** *(required)*  
- **message** *(required)*  

**Response**:
```json
{
  "message": "Message sent successfully."
}
```
- **HTTP 200**: Email sent.  
- **HTTP 400**: Missing fields.  
- **HTTP 500**: SES error or unexpected error.

---

### **5. PayPal Integration**

The API integrates with PayPal (Sandbox) to handle **order creation** and **subscriptions**. It obtains an **access token** from PayPal’s OAuth endpoint, then interacts with PayPal’s Checkout API.

#### **POST** `/create-paypal-order`
**Description**: Creates a one-time PayPal order for donations.  
**Request Body**:
```json
{
  "amount": 50,
  "custom_id": "Donation-123",
  "currency": "USD"  // optional; defaults to "USD"
}
```
- **amount** *(required, number)*: Must be > 0  
- **custom_id** *(required, string)*: A custom reference ID  
- **currency** *(optional, string)*: Defaults to “USD”  

**Response**:
```json
{
  "id": "PAYPAL_ORDER_ID",
  "message": "PayPal order created successfully."
}
```
- **HTTP 200** or **201**: Contains the PayPal **order ID**.  
- **HTTP 400**: Invalid input.  
- **HTTP 500**: Issues creating the order or unexpected error.

---

#### **POST** `/create-paypal-subscription`
**Description**: Creates a PayPal product (if needed) and subscription for recurring donations.  
**Request Body**:
```json
{
  "amount": 20,
  "custom_id": "RecurringDonation-XYZ"
}
```
- **amount** *(required, number)*: The monthly (or recurring) donation amount.  
- **custom_id** *(required, string)*  

**Response**:
```json
{
  "subscription_id": "I-XXXXXXXXXXXXXXXX", 
  "message": "Subscription created successfully."
}
```
- **HTTP 200**: Subscription created.  
- **HTTP 400** / **500**: Error scenarios (invalid parameters, issues connecting to PayPal, etc.).

*(Internally, the code:)*  
- Obtains a PayPal token  
- Creates a PayPal product if needed  
- Creates a billing plan and then a subscription  
- Returns the newly created subscription ID  

---

## **d. Example Authentication & Call Flow**

1. **Sign Up**  
   - `POST /signup` with email, password, first/last name.  
2. **Confirm User** (if required by your Cognito settings)  
   - `POST /confirm` with email.  
3. **Login**  
   - `POST /login` to get `access_token`, `id_token`, and `refresh_token`.  
4. **(Optional) Confirm Email**  
   - If email verification is required, call `POST /confirm-email` or `POST /confirm-email-resend` with the tokens.  
5. **Use Authenticated Endpoints**  
   - Some calls require an `access_token` in the **body** or an **email** query param to identify the user.  

---

## **e. Security & Best Practices**

- **Always Use HTTPS**: Ensure all requests go over HTTPS to secure user credentials and tokens.  
- **Protect Cognito Tokens**: On the front end, store tokens securely (e.g., in HttpOnly cookies or secure storage) to prevent XSS/CSRF attacks.  
- **SES Sender Verification**: Confirm that **`get_sender_email()`** returns a verified email in SES.  
- **PayPal Sandbox vs. Live**: The example calls the **sandbox** endpoint. Switch to live endpoints (`https://api-m.paypal.com`) before production.  

---

## **f. Status Codes & Common Errors**

| Status Code | Meaning                                             |
|-------------|-----------------------------------------------------|
| **200/201** | Success (OK/Created)                                |
| **400**     | Bad Request (missing/invalid parameters, etc.)      |
| **401**     | Unauthorized (invalid credentials)                  |
| **403**     | Forbidden (not authorized to perform that action)   |
| **404**     | Not Found (user or resource doesn’t exist)          |
| **429**     | Too Many Requests (Cognito or SES rate-limiting)    |
| **500**     | Internal Server Error (unexpected exception)        |
| **503**/**504** | Service Unavailable / Gateway Timeout (PayPal errors, etc.) |

---

## **g. Additional Links / Tools**

- **AWS Cognito Documentation**: [https://docs.aws.amazon.com/cognito](https://docs.aws.amazon.com/cognito)  
- **PayPal Checkout Documentation**: [https://developer.paypal.com/docs/checkout/](https://developer.paypal.com/docs/checkout/)  
- **AWS SES**: [https://docs.aws.amazon.com/ses](https://docs.aws.amazon.com/ses)  

---

# **Conclusion**

This API provides a comprehensive solution for user management, password resets, email verification, donation order creation, and subscriptions. By following the endpoints outlined, you can integrate front-end workflows that manage user sign-ups/logins, handle email confirmations, process donations with PayPal, and capture contact form submissions—helping to streamline engagement and giving for your church’s infrastructure.

For any advanced scenarios (e.g., 2FA, role-based access control, or advanced PayPal features like Webhooks), additional endpoints or configuration changes may be required. Always test each endpoint thoroughly in **development** or **sandbox** environments before deploying to production.