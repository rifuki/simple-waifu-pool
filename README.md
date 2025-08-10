# Simple Waifu Poll (Stacks DApp)

A simple, decentralized polling application built on the **Stacks blockchain**.  
Users can create polls, vote for their favorite options, and view results in real-time — all secured on-chain.

---

## ✨ Features

- **Decentralized Polling** — All poll data and votes stored securely on the Stacks blockchain.
- **Wallet Integration** — Connects with Hiro Wallet (and other Stacks-compatible wallets) for authentication & transaction signing.
- **Create Polls** — Add 2–5 options, set poll duration.
- **Vote on Polls** — Only authenticated users can vote.
- **Real-time Results** — View vote counts and percentages instantly.
- **Clean UI** — Single-page app with a simple, modern interface.

---

## 🛠 Tech Stack

**Frontend**

- Framework: [React 19](https://react.dev/) + TypeScript
- Build Tool: [Vite](https://vitejs.dev/)
- Styling: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)

**Blockchain Interaction**

- [`@stacks/connect`](https://docs.hiro.so/stacks.js/connect) — Wallet authentication & transaction popups
- [`@stacks/transactions`](https://docs.hiro.so/stacks.js/transactions) — Smart contract interaction

**Backend (Smart Contract)**

- Language: [Clarity](https://docs.stacks.co/write-smart-contracts/clarity-overview)
- Blockchain: [Stacks](https://stacks.co/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Hiro Wallet** browser extension (Testnet mode enabled)
- **Testnet STX tokens** (get from [Stacks Faucet](https://faucet.hiro.so/))
- (Optional) [Clarinet](https://docs.hiro.so/clarinet/installation) CLI for local contract testing

---

### 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd simple-waifu-poll-frontend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Deploy the Smart Contract

Deploy your Clarity contract to **Stacks Testnet**. With Clarinet:

```bash
clarinet contract deploy --net testnet
```

Copy the **contract address** and **contract name** from the output.

---

### 4️⃣ Configure the Frontend

Open `src/lib/constants.ts` and replace with your deployed contract details:

```ts
export const CONTRACT_ADDRESS = "ST13J8Q81A768CWVF2YPWMZGRMRERPVKMGD2Q02W4";
export const CONTRACT_NAME = "simple-waifu-pool-test-1";
```

> **Important:** Your contract must have this read-only function:

```clarity
(define-read-only (get-next-poll-id)
  (var-get next-poll-id))
```

---

### 5️⃣ Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```
/simple-waifu-poll-frontend
├── public/                # Static assets
├── src/
│   ├── components/        # UI components
│   │   └── ui/            # shadcn/ui primitives
│   ├── hooks/              # Custom hooks
│   │   └── useStacks.ts
│   ├── lib/
│   │   ├── constants.ts    # Contract config
│   │   ├── contract.ts     # Blockchain functions
│   │   └── utils.ts        # Utility helpers
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── CreatePoll.tsx
│   │   └── ViewPoll.tsx
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 📜 License

This project is licensed under the MIT License.

---

## 💡 Notes

- Ensure you are connected to **Stacks Testnet** before interacting with the app.
- Gas fees are paid in **Testnet STX**.
- All votes and poll creations are **immutable** once confirmed on-chain.
