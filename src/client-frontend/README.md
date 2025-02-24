# **Front-End Documentation Outline**

## **1. Project Setup & Environment**

1. **Technology Stack**  
   - **Framework**: React (TypeScript)  
   - **Router**: `react-router-dom`  
   - **State Management**: Redux Toolkit / `@reduxjs/toolkit`  
   - **Styling**: (Specify if you’re using MUI, CSS modules, styled-components, etc.)  
   - **Build Tool**: Vite (inferred from `import.meta.env`)  

2. **Environment Variables**  
   - **`VITE_API_LINK`**: Points to the backend API URL  
   - Document any other relevant env vars

3. **Installation & Running**  
   - **Install Dependencies**:  
     ```bash
     npm install
     ```
   - **Development Server**:  
     ```bash
     npm run dev
     ```
   - **Production Build**:  
     ```bash
     npm run build
     ```

---

## **2. App Overview**

1. **File Location**: `src/App.tsx`  
2. **Purpose**:  
   - Renders the top-level `<Routes>` for the application.  
   - Checks local storage on mount to restore user session (user + token) into Redux.

3. **User Session Restoration**  
   - **Local Storage Keys**:  
     - `user`: The authenticated user data (JSON format).  
     - `userToken`: The token (JWT or similar).  
   - **Redux Action**: `setLogin({ user, token })` from `userSlice`.  
     - Restores the user session if both values exist.

4. **Imports**:  
   - **Pages**: `Home`, `SignIn`, `SignUp`, etc.  
   - **Redux**: `useDispatch`, `setLogin`  
   - **`SERVER`**: The API base URL from `import.meta.env.VITE_API_LINK`

---

## **3. Routing Structure**

The `<Routes>` component defines the path-to-page mapping. Each route corresponds to a specific React component:

| **Path**                    | **Component**           | **Description**                                    |
|-----------------------------|-------------------------|----------------------------------------------------|
| `/`                         | `Home`                  | Main landing page of the site.                    |
| `/location`                 | `Location`              | Displays location info (map/address, etc.).       |
| `/auth/signin`             | `SignIn`                | User sign-in page.                                |
| `/auth/signup`             | `SignUp`                | User registration page.                           |
| `/auth/verify`             | `VerifyEmail`           | Email verification flow.                          |
| `/auth/signout`            | `SignOut`               | Manages user sign-out logic.                      |
| `/auth/created`            | `AccountCreated`         | Confirms account creation, shows next steps.      |
| `/auth/forgotpassword`      | `ForgotPassword`         | Initiates password reset flow.                    |
| `/auth/confirmpassword`     | `ConfirmNewPassword`     | Completes password reset with a confirmation code.|
| `/contribution`             | `ControPage`            | Possibly for a generic contributions/donations page. |
| `/benevolence`             | `BenevolencePage`        | Benevolence donation or info page.                |
| `/missions`                | `MissionsPage`           | Missions donation or info page.                   |
| `/dashboard`               | `Dashboard`              | Main user/admin dashboard after login.            |
| `/profile`                 | `Profile`                | User profile management page.                     |
| `/contactus`               | `ContactUs`              | Contact form page (likely emails via backend).    |
| `/terms`                   | `Terms`                  | Displays Terms of Service.                        |
| `/privacy`                 | `Privacy`                | Displays Privacy Policy.                          |

### **Route Details to Document**

- **User Authentication**: Indicate which routes require the user to be logged in (e.g., `/dashboard`, `/profile`) and how you handle unauthorized access. You might use a `RequireAuth` component or a similar pattern.  
- **UI/UX Flows**: Provide short flow descriptions (e.g., “User visits `/auth/signup`, fills out form, user is created, then redirected to `/auth/created`).  
- **Error Handling**: How do you handle 404 or invalid routes? (Not visible in this snippet—if you have a 404 component, mention it.)

---

## **4. Key Pages & Components (High-Level)**

Below are short descriptions. Add more details based on your app’s logic and design:

- **`Home`**: Landing page; might feature church info, hero banner, etc.  
- **`Location`**: Typically displays map, address, or directions.  
- **`SignIn` / `SignUp`**: Auth forms; calls backend (`/login` or `/signup` endpoints).  
- **`VerifyEmail`**: Handles email confirmation with codes.  
- **`ForgotPassword`** / `ConfirmNewPassword`**: Password reset flows.  
- **`Dashboard`**: Logged-in user’s overview; might show recent donations, announcements.  
- **`Profile`**: Let users update their info, manage password, etc.  
- **`ContactUs`**: A form that sends queries to the church (likely via SES on the backend).  
- **Donation-related pages**: `ControPage`, `BenevolencePage`, `MissionsPage`; each might present specific donation forms or content.  
- **`Terms` & `Privacy`**: Legal pages.

---

## **5. State & Data Management**

1. **Local Storage Restoration**  
   - In `App.tsx`, `useEffect` loads `user` + `userToken`.  
   - Dispatches `setLogin(...)` to set Redux state.  

2. **Redux Slices**  
   - **`userSlice`**: Manages user info and token.  
   - Potentially more slices (e.g., donation slice, settings slice, etc.) if your app grows.

3. **API Calls**  
   - Typically called from each page or from a `services/` folder.  
   - Reference the `SERVER` constant for the base API URL.  
   - For authentication flows, check how you pass tokens to the backend.

---

## **6. Security & Auth Considerations**

- **Token Storage**: Currently stored in local storage. Note potential security considerations (XSS risks).  
- **Route Protection**: Any route that requires an authenticated user (e.g., `/dashboard`, `/profile`) should check if `userToken` exists; if not, redirect to `/auth/signin`.  
- **Logout Flow**: On `/auth/signout`, presumably you remove tokens from local storage and clear Redux state.

---

## **7. Extending & Customizing**

- **Navigation & Layout**: If you have a top-level layout (header, footer, side nav), show where it’s defined. Possibly in `App.tsx` or a separate layout component.  
- **Theming & Styling**: Document your approach (MUI theme, CSS modules, etc.). If using MUI, mention your theme provider or custom theme config.  
- **Additional Middlewares or Guards**: If you add route guards for roles (e.g., admin vs. user), mention how that pattern would integrate with these routes.

---

## **8. Tips & Future Improvements**

- **Persist Redux State**: If you plan to keep user data beyond page refreshes, consider Redux Persist or a custom approach.  
- **Form Validation**: If you’re using libraries like Formik or React Hook Form, specify how forms are validated.  
- **Error Boundary / 404 Page**: If you add an error boundary or a not-found page, document it.

---

### **Conclusion**

This outline covers the major areas for front-end documentation based on `App.tsx`. Fill in details about each page’s functionality, any special styling patterns, or business logic. That way, other developers (or your future self) will know how the routes connect, how authentication is maintained, and what each page is responsible for.