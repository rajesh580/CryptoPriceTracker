# Cryptocurrency Price Tracker

A real-time cryptocurrency price tracker with portfolio management, price alerts, and technical analysis built with React frontend and Node.js/Express backend.

## Features

- **Real-Time Price Updates**: Live cryptocurrency prices updated every 30 seconds via WebSocket (Socket.IO)
- **Portfolio Management**: Track your cryptocurrency holdings and view current values in USD
- **Price Alerts**: Set price alerts for cryptocurrencies (above/below thresholds) with real-time notifications
- **Price Charts**: Interactive price history charts with technical indicators
- **Analytics**: Detailed metrics including RSI, MACD, SMA, highest/lowest prices, and more
- **Comparison**: Side-by-side comparison of multiple cryptocurrencies
- **User Authentication**: Secure JWT-based authentication with user accounts
- **Dark Mode**: Full dark mode support for comfortable viewing
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **Recharts** - Chart visualization
- **CSS3** - Styling with dark mode support

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time WebSocket communication
- **Axios** - HTTP client for external APIs
- **JWT** - Authentication

### External APIs
- **CoinGecko API** - Cryptocurrency price data

## Project Structure

```
client/                          # React frontend
├── public/
│   ├── index.html
│   └── manifest.json
└── src/
    ├── components/
    ├── App.js                   # Main app component
    ├── Portfolio.js             # Portfolio management
    ├── PriceChart.js            # Price charts
    ├── Analytics.js             # Analytics & indicators
    ├── Comparison.js            # Crypto comparison
    ├── AlertForm.js             # Price alert creation
    ├── AlertPopup.js            # Alert notifications
    ├── Auth.js                  # Login/Register
    ├── Navbar.js                # Navigation
    └── index.js

server/                          # Node.js/Express backend
├── models/
│   ├── User.js                  # User schema
│   ├── Portfolio.js             # Portfolio schema
│   ├── Alert.js                 # Price alert schema
│   └── Price.js                 # Price history schema
├── routes/
│   ├── userRoutes.js            # User endpoints
│   ├── portfolioRoutes.js        # Portfolio endpoints
│   ├── alertRoutes.js           # Alert endpoints
│   └── priceRoutes.js           # Price endpoints
├── services/
│   └── priceStreamer.js         # Real-time price updates
├── middleware/
│   └── authMiddleware.js        # JWT authentication
├── cron/
│   └── priceChecker.js          # Scheduled tasks
└── server.js                    # Express server setup
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cryptocurrency-tracker
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   Create `.env` file in the `server` directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/crypto-tracker
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```

5. **Start MongoDB**
   ```bash
   mongod
   ```

## Running the Application

### Development Mode

**Terminal 1 - Start the backend server:**
```bash
cd server
node server.js
```
Server will run on `http://localhost:5000`

**Terminal 2 - Start the frontend dev server:**
```bash
cd client
npm start
```
Client will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)

### Portfolio
- `GET /api/portfolio` - Get user's portfolio (protected)
- `POST /api/portfolio/add` - Add cryptocurrency to portfolio (protected)
- `PUT /api/portfolio/:coinId` - Update portfolio holding (protected)
- `DELETE /api/portfolio/:coinId` - Remove from portfolio (protected)

### Prices
- `GET /api/prices` - Get current prices for multiple coins
  - Query: `?coins=bitcoin,ethereum`
- `GET /api/prices/history/:coinId` - Get price history
  - Query: `?days=30`

### Alerts
- `GET /api/alerts` - Get user's alerts (protected)
- `POST /api/alerts` - Create new alert (protected)
- `PUT /api/alerts/:alertId` - Update alert (protected)
- `DELETE /api/alerts/:alertId` - Delete alert (protected)

## Real-Time Features

The application uses Socket.IO for real-time updates:

- **Price Updates**: Broadcast every 30 seconds
- **Alert Notifications**: Instant notification when price threshold is triggered
- **Connected Users**: Real-time user activity tracking

## Usage

1. **Create Account**: Register and log in
2. **Add Portfolio**: Add cryptocurrencies and quantities to your portfolio
3. **View Prices**: See real-time prices on the Dashboard
4. **Set Alerts**: Create price alerts to be notified when thresholds are reached
5. **Analyze**: View detailed analytics and price history charts
6. **Compare**: Compare multiple cryptocurrencies side-by-side

## Features in Detail

### Portfolio Management
- Add/remove cryptocurrencies
- Track total portfolio value in USD
- View individual holdings and their current prices

### Alerts
- Set price alerts (above or below threshold)
- Real-time notifications when thresholds are reached
- Alert history and management

### Analytics
- Technical indicators (RSI, MACD, SMA)
- Price statistics (high, low, average)
- 24-hour and custom time frame analysis

### Charts
- Interactive price history charts
- Multiple time frame views
- Hover tooltips with detailed information

## Authentication

The app uses JWT (JSON Web Tokens) for authentication:
- Tokens stored in localStorage
- Automatic token refresh on login
- Protected API routes with middleware

## Database

### User Model
- Email and password (hashed)
- Created/updated timestamps

### Portfolio Model
- User reference
- Cryptocurrency holdings
- Quantity and entry price

### Alert Model
- User reference
- Cryptocurrency and threshold
- Condition (above/below)
- Trigger status

### Price Model
- Historical price data
- Timestamp and currency

## Error Handling

- Input validation on frontend and backend
- Graceful error messages for users
- Server error logging for debugging
- Automatic cleanup of corrupted data

## Dark Mode

Toggle dark mode using the theme button in the navbar. Preferences are automatically saved.

## Future Enhancements

- [ ] Email notifications for price alerts
- [ ] Export portfolio as CSV/PDF
- [ ] Advanced technical indicators
- [ ] Cryptocurrency news feed
- [ ] Mobile app
- [ ] Social features (share portfolio, compare with friends)
- [ ] API key for third-party integrations

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and feature requests, please open an issue on GitHub.

## Acknowledgments

- CoinGecko API for cryptocurrency data
- React and Node.js communities
- All contributors and users

---

**Last Updated**: January 2026
