# LifeLink — Blood Donation & Blood Request Management System

A fully front-end (HTML/CSS/JS) blood donation and request platform, using
`localStorage` as the data layer so it's easy to try instantly and easy to
swap for a real backend later.

## Running it
No build step needed. Open `index.html` in a browser, or serve the folder
with any static server, e.g.:

```
npx serve .
```

## Demo accounts
| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Donor   | ali.donor@demo.com     | Demo@1234  |
| Donor   | sana.donor@demo.com    | Demo@1234  |
| Patient | hira.patient@demo.com  | Demo@1234  |

## Structure
```
Blood-Donation-System/
├── index.html              Landing page
├── login.html               Login
├── signup.html               Registration (donor/patient)
├── donor-dashboard.html     Home · Donate · AI Assistant · Contact
├── patient-dashboard.html   Home · Find a Donor · Blood Request · AI Assistant · Contact
├── css/
│   ├── style.css            Design tokens + landing page
│   ├── auth.css             Login / signup
│   └── dashboard.css        Both dashboards
└── js/
    ├── storage.js           localStorage data layer, toasts, confirm modal
    ├── validation.js        Form validation helpers
    ├── auth.js               Signup / login / session / logout
    ├── donor.js               Donor dashboard logic + chatbot
    ├── patient.js             Patient dashboard logic + chatbot
    └── main.js               Landing page interactivity
```

## Notes on swapping in a real backend
All data access goes through the `DB` object in `js/storage.js`
(`getUsers`, `addUser`, `updateUser`, `getRequests`, `addRequest`,
`getSession`, `setSession`). Replace the bodies of those functions with
`fetch()` calls to your API and the rest of the app keeps working unchanged.

## Design notes
Visual identity: **LifeLink** — a heartbeat/ECG line motif used in the logo,
hero visual, section dividers and loading states, on a white / crimson /
warm-gray palette (Fraunces for display type, Inter for body, IBM Plex Mono
for data and stats).
