# **Front-End Documentation Outline (Updated)**

## **1. Project Setup & Environment**

1. **Technology Stack**  
   - **Framework**: React (TypeScript)  
   - **Router**: `react-router-dom`  
   - **State Management**: Redux Toolkit (`@reduxjs/toolkit`)  
   - **Build Tool**: Vite
   - **Styling**: MUI

2. **Environment Variables**  
   Defined in your `.env` file, all prefixed with `VITE_` for Vite to expose them at build time.  
   - **`VITE_API_LINK`**: Base URL for your backend API (`https://lkhnk9mouh.execute-api.us-west-1.amazonaws.com/prod`).  
   - **`VITE_BT_CARD_DESCRIPTION`**: Text for a Bible Talk event card description.  
   - **`VITE_BT_CARD_LOCATION`**: Displays “Contact Us” or actual location label for a Bible Talk event.  
   - **`VITE_BT_CARD_TIME`**: Starting time (e.g., 7:30PM).  
   - **`VITE_CHURCH_CITY`**: City name, used for references (e.g., “Las Vegas”).  
   - **`VITE_CONTACT_EMAIL`**: Primary contact email for your church.  
   - **`VITE_CONTACT_NUMBER`**: Main contact phone number.  
   - **`VITE_CONTACT_US_STREET_LOCATION`** / **`VITE_CONTACT_US_CITY_LOCATION`**: Street address, city & zip used for contact info.  
   - **`VITE_DEVO_CARD_DESCRIPTION`** / **`VITE_DEVO_CARD_LOCATION`** / **`VITE_DEVO_CARD_TIME`**: Similar to BT card, but for Devo events.  
   - **`VITE_DOMAIN`**: Domain reference (e.g., “restoredchurchlv”), possibly used for building URLs or references.  
   - **`VITE_FACEBOOK_URL`**, **`VITE_INSTAGRAM_URL`**: Social links displayed in footers or contact sections.  
   - **`VITE_GOOGLE_MAP_IMBED`**: Google Maps embed link for the church location.  
   - **`VITE_MIDWEEK_CARD_DESCRIPTION`** / **`VITE_MIDWEEK_CARD_LOCATION`** / **`VITE_MIDWEEK_CARD_TIME`**: Content for midweek event info.  
   - **`VITE_SUNDAY_CARD_LOCATION`** / **`VITE_SUNDAY_CARD_TIME`**: Sunday service location and start time.

   **Usage**:  
   - Access these in components or pages via `import.meta.env.VITE_<VARIABLE_NAME>`.  
   - Typically used to dynamically populate “location,” “time,” or “description” text in UI cards or event components.  
   - Eliminates hard-coded strings so you can easily update schedules or contact info without redeploying code (just rebuild with updated `.env`).

3. **Installation & Running**  
   ```bash
   npm install       # or yarn
   npm run dev       # local development
   npm run build     # production build
   ```
   - **Note**: When deploying, ensure your `.env` or environment variables are set in your hosting environment.  

---

## **2. App Overview**

1. **File Location**: `client-frontend/src/App.tsx`  
2. **Purpose**:  
   - Renders the top-level React Router `<Routes>` for your site.  
   - Checks local storage on mount to restore user session (`user` & `userToken`) via Redux.  
   - Pulls the environment variable `VITE_API_LINK` as `SERVER` for any API calls that occur in pages or services.

3. **Key Logic**:  
   ```tsx
   useEffect(() => {
     const user = localStorage.getItem('user');
     const token = localStorage.getItem('userToken');
     
     if (user && token) {
       dispatch(setLogin({ user: JSON.parse(user), token: JSON.parse(token) }));
     }
   }, [dispatch]);
   ```
   - If both `user` and `token` exist, dispatch `setLogin` to store them in Redux, effectively persisting login across refreshes.

---

## **3. Routing Structure**

Defined in `<Routes>` within `App.tsx`. The main routes are:

| **Path**                    | **Component**          | **Description**                                                    |
|-----------------------------|------------------------|--------------------------------------------------------------------|
| `/`                         | `Home`                 | Landing page for the app. Possibly uses `VITE_CHURCH_CITY` or other env vars. |
| `/location`                 | `Location`             | Page showing physical address details, possibly embedding `VITE_GOOGLE_MAP_IMBED`. |
| `/auth/signin`             | `SignIn`               | Login page; calls your backend using `SERVER + '/login'`.          |
| `/auth/signup`             | `SignUp`               | Registration page.                                                 |
| `/auth/verify`             | `VerifyEmail`          | Handles email confirmation flows with token codes.                 |
| `/auth/signout`            | `SignOut`              | Clears user session from local storage & Redux.                    |
| `/auth/created`            | `AccountCreated`        | Confirmation page after successful sign-up.                        |
| `/auth/forgotpassword`      | `ForgotPassword`        | Initiates password reset.                                          |
| `/auth/confirmpassword`     | `ConfirmNewPassword`    | Completes password reset with code.                                |
| `/contribution`             | `ControPage`           | Possibly a “Contribution” donation page.                            |
| `/benevolence`             | `BenevolencePage`       | Donation info or form for benevolence.                             |
| `/missions`                | `MissionsPage`          | Donation page for missions.                                        |
| `/dashboard`               | `Dashboard`             | A user/dashboard page. Possibly restricted to signed-in users.     |
| `/profile`                 | `Profile`               | User profile editing.                                              |
| `/contactus`               | `ContactUs`             | Contact form, emailing `VITE_CONTACT_EMAIL` or storing data.       |
| `/terms`                   | `Terms`                 | Terms of Service page.                                             |
| `/privacy`                 | `Privacy`               | Privacy Policy page.                                               |

**Potential Route Guard**: If certain routes (like `/dashboard`, `/profile`) require authentication, consider wrapping them with a `RequireAuth` component or a similar guard.

---

## **4. Usage of Env Variables in UI Components**

- **Event Card Pages** (e.g., Bible Talk, Devo, Midweek, Sunday):  
  - Each page or card can read from environment vars to display time, location, and a short description. For example:  
    ```tsx
    import { VITE_BT_CARD_DESCRIPTION, VITE_BT_CARD_TIME } from 'vite-env'; // pseudo-code
    ...
    const MyBibleTalkCard = () => (
      <div>
        <p>{import.meta.env.VITE_BT_CARD_DESCRIPTION}</p>
        <p>Time: {import.meta.env.VITE_BT_CARD_TIME}</p>
      </div>
    );
    ```
- **Contact Info**:  
  - Possibly shown in a footer or “Contact Us” page using `VITE_CONTACT_EMAIL`, `VITE_CONTACT_NUMBER`, and the address info.  
- **Map Embed**:  
  - The “Location” page might embed a Google map using `VITE_GOOGLE_MAP_IMBED`.

This structure centralizes your dynamic text, so updating event schedules or contact info only requires a change in `.env`.

---

## **5. State & Data Management**

1. ### **Redux Slice**:  
   **Overview of the Redux `userAuthAndInfoSlice`**
    **Slice Location & Import**
    - Typically defined in `src/modules/ducks/userSlice.ts` (based on your code).
    - Imported into the Redux store (e.g., `store.ts`) and used via `<Provider>` in your `main.tsx` or `index.tsx`.

    ### **Initial State**

    ```ts
    interface User {
    user_name: string;
    email: string;
    }

    interface InitialState {
    user: User | null;
    token: {
        user_id: string | null;
        id_token: string | null;
        access_token: string | null;
        refresh_token: string | null;
    };
    language: string;
    }
    ```
    - **`user`**: Basic user info (username, email). `null` if logged out.  
    - **`token`**: Contains `user_id`, `id_token`, `access_token`, and `refresh_token`.  
    - For example, these can be retrieved from Cognito or any other auth provider.  
    - `null` values when logged out.  
    - **`language`**: A string that defaults to whatever is in `localStorage` under `language` or `'en-US'`.

    **Reducers & Actions**

    1. **`setLogin`**  
    - Sets `state.user` and `state.token` from the action payload.  
    - Usage example:
        ```ts
        dispatch(setLogin({
        user: { user_name: "John", email: "john@example.com" },
        token: {
            user_id: "abc123",
            id_token: "id_token_value",
            access_token: "access_token_value",
            refresh_token: "refresh_token_value",
        }
        }));
        ```
    - Typically called after a successful sign-in or sign-up flow to store user data and tokens.

    2. **`setLogout`**  
    - Clears out `state.user` and resets `state.token` fields to `null`.  
    - Called when the user logs out or their session expires.  

    3. **`setLanguage`**  
    - Updates `state.language` with the new language code.  
    - Also saves to `localStorage` so it persists across sessions.  
    - Example:
        ```ts
        dispatch(setLanguage("fr-FR"));
        ```
    - Could be used for multi-lingual support or user preference.

    **Selectors**

    1. **`selectIsLoggedIn`**  
    - Returns `true` if both `user` and `token.access_token` are present.  
    - Helps you protect routes or conditionally display UI (e.g., hide sign-in button if already logged in).

    2. **`selectLanguage`**  
    - Retrieves the current language setting from Redux state.  
    - Useful for localizing UI text based on `en-US`, `fr-FR`, etc.

2. ### **Local Storage**:  
   - Stores `user` and `userToken` after login.  
   - Session is restored on `App.tsx` mount.  
3. **API Calls**:  
   - Typically reference `SERVER` (=`import.meta.env.VITE_API_LINK`) in services or pages.  
   - Example: `fetch(`${SERVER}/login`, { ... })`.

---

## **6. Security & Auth Considerations**

- **Token Storage**: Storing tokens in local storage is convenient but can be susceptible to XSS. Evaluate trade-offs vs. HttpOnly cookies.  
- **Protecting Routes**: If unauthorized users shouldn’t see `/dashboard`, ensure you redirect them to `/auth/signin` or show an error if `token` is null.  
- **Logout Flow**: The `SignOut` component presumably clears local storage and Redux state.

---

## **7. Tips, Gotchas, and Future Enhancements**

- **Updating `.env`**: Each time you change environment variables, you need to rebuild with Vite.  
- **Multiple Environments**:  
  - Create `.env.development` and `.env.production` if you need different values (like dev vs. prod API links).  
- **404 Route**: Currently, there’s no explicit fallback route. Consider adding a `<Route path="*" element={<NotFound />}/>`.  
- **Route Guards**: For a more robust approach, consider a `RequireAuth` wrapper.  
- **Styling**: Document if you use a theming approach (like MUI or custom Sass).  

---

### **Conclusion**

By consolidating the environment variables, you’ve made it easy to configure event details, contact info, and API endpoints without diving into the code. This outline covers:

1. Project environment & setup (including your `.env` vars).  
2. App logic for route structure & session restoration.  
3. High-level pages and how they might use environment-driven data.  
4. Key considerations around authentication, state management, and future enhancements.


Below is an **updated documentation outline** that integrates details of the `userSlice` (referred to as `userAuthAndInfoSlice`) into the overall front-end architecture. This addition clarifies how authentication data and language preferences are stored in Redux.