# 📈 InC\_StockZ

InC\_StockZ is a decentralized stock market tracking and simulation platform built for the **InC '26** hackathon. Leveraging the **Internet Computer (ICP)** and deployed via **Caffeine**, it provides a high-performance, tamper-proof environment for financial data visualization and mock trading.

## 🚀 Live Demo

Access the live application here:
**[InC\_StockZ on Caffeine](https://stockz-hx8.caffeine.xyz/#caffeineAdminToken=028088c42c59fa6d998a1aacb824518c7ccbee0a6e8d35591f616eebbe4157ae)**

-----

## ✨ Features

  * **Real-time Market Data:** Live tracking of global stock indices and individual tickers.
  * **Decentralized Backend:** Built on the Internet Computer for enhanced security and transparency.
  * **Seamless Deployment:** Fully integrated with the Caffeine cloud for instant scaling.
  * **Modern UI:** A responsive and intuitive interface built with TypeScript and CSS.
  * **Dockerized Environment:** Ensures consistency across development and production environments.

-----

## 🛠️ Tech Stack

  * **Frontend:** TypeScript, JavaScript, HTML5, CSS3
  * **Infrastructure:** [Internet Computer (ICP)](https://internetcomputer.org/)
  * **Deployment:** [Caffeine](https://www.google.com/search?q=https://caffeine.xyz/)
  * **DevOps:** Docker, Shell Scripting

-----

## 📂 Project Structure

```text
InC_StockZ/
├── src/                # Frontend and backend source code
├── scripts/            # Automation and utility scripts
├── Dockerfile          # Containerization configuration
├── dfx.json            # Internet Computer configuration
├── caffeine.lock.json  # Caffeine deployment lock file
├── build.sh            # Build automation script
└── deploy.sh           # Deployment automation script
```

-----

## ⚙️ Setup & Installation

### Prerequisites

  * [Node.js](https://nodejs.org/) (v18 or higher)
  * [DFX SDK](https://www.google.com/search?q=https://internetcomputer.org/docs/current/developer-docs/setup/install/index.md) (for ICP development)
  * [Docker](https://www.docker.com/)

### Local Development

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/GitBeat16/InC_StockZ.git
    cd InC_StockZ
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Start a local ICP replica:**

    ```bash
    dfx start --background
    ```

4.  **Deploy canisters locally:**

    ```bash
    dfx deploy
    ```

-----

## 🚢 Deployment

The project is configured for automated deployment to the Caffeine cloud.

**Build and Deploy:**

```bash
chmod +x build.sh deploy.sh
./build.sh
./deploy.sh
```

-----

## 🤝 Contributing

1.  Fork the project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

-----

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

-----

## 🏆 Hackathon

Developed for **InC '26**.

  * **Repository:** [GitBeat16/InC\_StockZ](https://github.com/GitBeat16/InC_StockZ)
  * **Author:** [GitBeat16](https://github.com/GitBeat16)
