# RewaMart - Smart Shopping & Investment Platform

RewaMart is a mobile-first web platform for Tanzania that combines e-commerce, digital wallets, cashback rewards, and investment products.

## Features

### 🛍️ Shopping & Marketplace
- Browse products across categories (Electronics, Fashion, Home, Beauty)
- Search functionality
- Real-time cashback calculation (4-20%)
- Shopping cart and checkout simulation

### 💰 Digital Wallet
- Track balance, earnings, and investments
- Transaction history with filtering
- Withdrawal simulation with fee calculation (2%)
- Auto-invest feature to automatically invest cashback

### 📈 Investment Platform
- **UTT AMIS**: Flexible mutual funds
- **Government Bonds**: 2-20 year treasury bonds
- **Treasury Bills**: Short-term securities
- **M-Wekeza**: Mobile-based micro-investments
- **DSE Stocks**: Shares from top Tanzanian companies
- Portfolio tracking and management

### 👥 Referral Program
- Unique referral codes
- 5% commission on referrals
- 10% welcome bonus for new users
- Earnings dashboard

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks + LocalStorage
- **Font**: Inter (Google Fonts)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Application**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
rewamart/
├── app/                  # Next.js App Router pages
│   ├── layout.js         # Root layout
│   ├── page.js           # Dashboard
│   ├── shop/             # Marketplace
│   ├── wallet/           # Wallet & Transactions
│   ├── invest/           # Investment Platform
│   ├── referral/         # Referral Program
│   └── profile/          # User Profile
├── components/           # Reusable UI components
├── lib/                  # Business logic & utilities
│   ├── wallet.js         # Wallet management
│   ├── investments.js    # Investment logic
│   ├── referrals.js      # Referral system
│   ├── products.js       # Product catalog
│   └── storage.js        # LocalStorage wrapper
└── public/               # Static assets
```

## Demo Notes

⚠️ **This is a prototype version.**
- All transactions are simulated.
- Data is stored in your browser's LocalStorage.
- Clearing browser data will reset the application.
- No real money is processed.

## License

MIT License - Built for Tanzania 🇹🇿
