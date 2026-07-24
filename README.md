# ❤️ Charity DApp - Blockchain Based Charity Donation Platform

A decentralized charity management platform built using **Solidity, Hardhat, Ethers.js, and MetaMask**. The application enables verified charities to create fundraising causes with milestones, allows donors to contribute transparently, and releases funds only after owner approval.

---

## 📌 Project Overview

Traditional charity systems often lack transparency and accountability. This project leverages blockchain technology to provide a secure and transparent donation platform where:

- Registered charities are verified by the administrator.
- Verified charities create fundraising causes.
- Each cause contains milestones.
- Donors contribute Ethereum directly.
- Funds are released only after milestone approval.
- Every transaction is permanently recorded on the blockchain.

---

# ✨ Features

### 👨‍💼 Owner

- Verify registered charities
- Approve milestones
- Release milestone funds
- View all charities and causes

### 🏢 Charity

- Register on the platform
- Create fundraising causes
- Add milestones
- Withdraw approved funds

### ❤️ Donor

- Browse verified charities
- Donate ETH
- View causes
- Download donation receipt (PDF)

### 🔗 Blockchain Features

- Smart Contract based authorization
- MetaMask Wallet Integration
- Event Logging
- Transparent Transactions
- Milestone Based Fund Release
- Pull Payment Withdrawal Pattern

---

# 🏗️ System Architecture

```
                +---------------------+
                |     Frontend        |
                | HTML CSS JavaScript |
                +----------+----------+
                           |
                           |
                     ethers.js v6
                           |
                     MetaMask Wallet
                           |
                    Hardhat Local Node
                           |
                    Solidity Smart Contract
                           |
              CharityRegistry.sol Contract
```

---

# 📂 Project Structure

```
CHARITY/
│
├── artifacts/                 # Compiled contracts
├── cache/                     # Hardhat cache
│
├── charity-dapp/
│   ├── app.js                 # Frontend Logic
│   ├── index.html             # User Interface
│   └── style.css              # Styling
│
├── contracts/
│   └── CharityRegistry.sol    # Smart Contract
│
├── scripts/
│   └── deploy.js              # Deployment Script
│
├── hardhat.config.js
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Technologies Used

## Blockchain

- Solidity 0.8.24
- Ethereum Virtual Machine (EVM)

## Development

- Hardhat
- Node.js
- npm

## Frontend

- HTML5
- CSS3
- JavaScript (ES6)

## Libraries

- ethers.js v6
- jsPDF

## Wallet

- MetaMask

---

# 🔐 User Roles

## Owner

- Verify charities
- Approve milestones
- Release milestone funds

---

## Charity

- Register
- Create causes
- Add milestones
- Withdraw released funds

---

## Donor

- Browse causes
- Donate ETH
- Download receipt

---

# 🔄 Workflow

```
Register Charity
        │
        ▼
Owner Verifies Charity
        │
        ▼
Create Cause
        │
        ▼
Create Milestone
        │
        ▼
Donor Donates ETH
        │
        ▼
Owner Approves Milestone
        │
        ▼
Owner Releases Funds
        │
        ▼
Charity Withdraws Funds
```

---

# 📜 Smart Contract Functions

## Charity Management

- registerCharity()
- verifyCharity()

## Cause Management

- createCause()

## Milestone Management

- createMilestone()
- approveMilestone()
- releaseMilestone()

## Donations

- donate()
- withdraw()

## View Functions

- getCharities()
- getCauses()
- getCausesByCharity()
- getMilestone()
- isCharity()

---

# 📢 Events

The smart contract emits the following blockchain events:

- CharityRegistered
- CharityVerified
- CauseCreated
- MilestoneCreated
- DonationMade
- MilestoneApproved
- MilestoneReleased
- FundsWithdrawn

These events are displayed in real time on the frontend.

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/charity-dapp.git

cd charity-dapp
```

Install dependencies

```bash
npm install
```

Compile Smart Contract

```bash
npx hardhat compile
```

Start Hardhat Local Blockchain

```bash
npx hardhat node
```

Open another terminal

Deploy Contract

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address.

Update

```
charity-dapp/app.js
```

Replace

```javascript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

with the deployed address.

---

# 🌐 Frontend

Open

```
charity-dapp/index.html
```

using

- VS Code Live Server

or

```bash
python -m http.server
```

---

# 🦊 MetaMask Configuration

Create Custom Network

Network Name

```
Localhost 8545
```

RPC URL

```
http://127.0.0.1:8545
```

Chain ID

```
31337
```

Currency

```
ETH
```

Import Hardhat Accounts

- Account #0 → Owner
- Account #1 → Charity
- Account #2 → Donor

---

# 🧪 Testing Workflow

### Charity

- Register
- Wait for verification

### Owner

- Verify Charity

### Charity

- Create Cause

### Charity

- Add Milestone

### Donor

- Donate ETH

### Owner

- Approve Milestone

### Owner

- Release Milestone

### Charity

- Withdraw ETH

---
<!--
# 📸 Screenshots

Add screenshots here.

```
screenshots/

Home.png

Owner.png

Charity.png

Donation.png

Events.png

Receipt.png
```

Example

```markdown
![Home](screenshots/home.png)

![Donation](screenshots/donation.png)
```
-->
---

# 🔒 Security Features

- Owner Authorization
- Verified Charity Validation
- Milestone Approval
- Pull Payment Withdrawal Pattern
- Checks-Effects-Interactions Pattern
- Event Logging
- MetaMask Transaction Signing

---

# 🚧 Future Enhancements

- IPFS Document Storage
- DAO Governance
- ERC20 Token Donations
- QR Code Donations
- Email Notifications
- Multi-Signature Owner
- Sepolia Testnet Deployment
- Mobile Responsive UI
- Analytics Dashboard
- Charity Ratings

---
Blockchain | AI/ML | Full Stack Development

---

# 📄 License

This project is developed for academic and educational purposes.
