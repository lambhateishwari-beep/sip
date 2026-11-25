THE GOLDEN SIP - OWNER MENU STARTER

Features:
- Customers can view the menu without logging in.
- Owner Access button in the top corner.
- Owner email is restricted in the UI to lambhateishwari@gmail.com.
- Owner can add/delete categories and add/edit/delete dishes.
- Firebase Authentication and Firestore are required for login and saving.

SETUP (REQUIRED BEFORE DEPLOYING):
1. Create a Firebase project at https://console.firebase.google.com/
2. In Firebase Authentication, enable Email/Password.
3. Create the account:
   Email: lambhateishwari@gmail.com
   Password: use the password you supplied in ChatGPT; set it in Firebase's account creation form.
4. Create a Firestore Database.
5. Firebase project settings > General > Your apps > create a Web app and copy the config values.
6. Edit app.js and replace all PASTE_ placeholders in firebaseConfig with the real config.
7. In Firebase Authentication, open the owner account and copy its UID.
8. In firestore.rules, replace PASTE_OWNER_UID with that UID. Publish the rules in Firebase Firestore Rules.
9. Upload index.html, app.js, style.css to your GitHub repository root. Firestore rules are pasted/published in Firebase, not website files.
10. Deploy via Vercel connected to the GitHub repository.

IMPORTANT:
- Do not commit the owner's password or private keys into GitHub.
- Firebase web config is client-side config; security relies on Authentication and Firestore rules.
- This is a standalone simple menu starter, not integrated into your existing Golden Sip design.
- Categories and dishes are stored in Firestore. Menu reads are public. Writes are restricted to the UID specified in rules.
