# Great People

Great People is a local-first prototype for a private Chattanooga trade-provider directory. It focuses on trusted recommendations from people you personally know instead of anonymous public reviews.

## What the app does

- Searches providers by trade, capabilities, contact details, endorsement names, completed projects, cost, and notes.
- Filters providers by specific capabilities such as deck repair, EV chargers, water heaters, and HVAC tune ups.
- Shows who endorsed each provider, what project was completed, and the reported project cost.
- Supports a demo owner workflow where only the owner can approve contributors and pending provider submissions.
- Creates a shareable invite link that opens the access panel for trusted people to request contributor access.

## Running locally

```bash
npm start
```

Then open <http://localhost:4173>.

## Demo owner access

The prototype stores data in the browser with `localStorage`. Use the demo owner access code below to unlock approval tools on your device:

```text
chatt-owner
```

A production version should replace this local demo authorization with server-side authentication, invite tokens, and row-level access controls.
