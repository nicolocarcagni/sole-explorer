# ☀️ Sole Explorer

Welcome to the **Sole Explorer**, a modern and intuitive interface for navigating the Sole blockchain. This project allows users to explore blocks, verify transactions, and check address balances with a sleek, user-friendly design.

## 🚀 Features

*   **Real-time Block Feed**: View the latest blocks as they are mined.
*   **Deep Dive Search**: Find exactly what you're looking for by searching for Block Hashes, Transaction IDs (TXID), or Wallet Addresses.
*   **Detailed Views**:
    *   **Blocks**: Inspect block height, timestamp, validator info, and included transactions.
    *   **Transactions**: Analyze inputs, outputs, and value transfers.
    *   **Addresses**: Check current balances and transaction history.
*   **Responsive Design**: Optimized for both desktop and mobile viewing with a dark-mode "Night" theme.

## 🛠️ Tech Stack

Built with cutting-edge web technologies for speed and reliability:

*   **[React 19](https://react.dev/)**: The library for web and native user interfaces.
*   **[Vite](https://vitejs.dev/)**: Next Generation Frontend Tooling.
*   **[TypeScript](https://www.typescriptlang.org/)**: Strongly typed JavaScript.
*   **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework for rapid UI development.
*   **[Lucide React](https://lucide.dev/)**: Beautiful & consistent icons.
*   **[React Router 7](https://reactrouter.com/)**: Client-side routing.

## 🏁 Getting Started

Follow these steps to get the explorer running on your local machine.

### Prerequisites

*   **Node.js** (v18 or higher recommended)
*   **npm** or **yarn**

    git clone https://github.com/ncarcagni/sole-explorer.git
    cd sole-explorer
    ```

2.  **Install dependencies**
    
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

    The app should now be running at `http://localhost:5173`.

## ⚙️ Configuration

The application connects to a Sole blockchain node. The API endpoint is configured in `constants.ts`:

```typescript
export const API_BASE_URL = 'https://sole.nicolocarcagni.dev';
```

To connect to a local node or a different network, simply update this URL.

## 📂 Project Structure

*   `pages`: Main view components (Home, BlockDetail, etc.).
*   `components`: Reusable UI components (Navbar, Layout, etc.).
*   `services`: API integration logic.
*   `types.ts`: TypeScript interfaces for the Sole protocol (Blocks, Txs).

## 🤝 Contributing

Contributions are welcome! If you find a bug or want to add a feature:

1.  Fork the repository.
2.  Create a new branch
3.  Commit your changes
4.  Push to the branch
5.  Open a Pull Request.

## 🤖 AI Acknowledgement

Some parts of this project were generated with the assistance of AI.
