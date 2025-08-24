# VeeServe - Service Booking Platform (MERN Stack)

A modern service booking platform built with the MERN (MongoDB, Express.js, React.js, Node.js) stack. This application allows customers to book various home services, service agents to manage their bookings, and administrators to oversee the entire platform.

## 🚀 Features

### Customer Features
- User registration and authentication
- Browse and search services by category
- Add services to cart
- Book services with date and time selection
- View booking history and status
- Profile management
- Real-time booking updates

### Service Agent Features
- Service agent login and dashboard
- View assigned bookings
- Update booking status (Yet To Serve, Serving, Served)
- View today's schedule
- Track service statistics

### Admin Features
- Admin dashboard with analytics
- Manage services (CRUD operations)
- Manage service agents
- View all bookings and users
- Add cities and categories
- Monitor platform statistics

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File uploads
- **nodemailer** - Email functionality
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **compression** - Response compression

### Frontend
- **React.js** - Frontend framework
- **Material-UI** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Context** - State management
- **React Toastify** - Notifications

## 📁 Project Structure

```
veeserve-mern/
├── server.js                 # Main server file
├── package.json             # Backend dependencies
├── models/                  # MongoDB models
│   ├── userModel.js
│   ├── serviceModel.js
│   ├── bookingModel.js
│   └── ...
├── routes/                  # API routes
│   ├── auth.js
│   ├── services.js
│   ├── bookings.js
│   └── ...
├── middleware/              # Custom middleware
│   ├── auth.js
│   └── upload.js
├── uploads/                 # File uploads
└── client/                  # React frontend
    ├── package.json
    ├── public/
    └── src/
        ├── components/
        ├── pages/
        ├── contexts/
        └── utils/
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd veeserve-mern
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   PORT=5000
   ```

5. **Start the development servers**

   **Option 1: Run both servers simultaneously**
   ```bash
   npm run dev
   ```

   **Option 2: Run servers separately**
   
   Backend (from root directory):
   ```bash
   npm run server
   ```
   
   Frontend (from client directory):
   ```bash
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/service-agent-login` - Service agent login

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Bookings
- `GET /api/bookings/user` - Get user bookings
- `GET /api/bookings/service-agent` - Get service agent bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/status` - Update booking status

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/:serviceId` - Remove item from cart
- `POST /api/cart/checkout` - Checkout cart

## 🔐 Authentication & Authorization

The application uses JWT tokens for authentication with different user types:
- **Customer** - Can book services and manage profile
- **Service Agent** - Can view and update assigned bookings
- **Admin** - Full access to manage platform

## 📱 User Roles

### Customer
- Register and login
- Browse services
- Add services to cart
- Book services
- View booking history
- Update profile

### Service Agent
- Login with username/password
- View assigned bookings
- Update booking status
- View today's schedule
- Track performance

### Admin
- Login with admin credentials
- Manage all services
- Manage service agents
- View all bookings and users
- Access analytics dashboard
- Manage platform settings

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables
3. Deploy using Git:
   ```bash
   heroku create
   git push heroku main
   ```

### Frontend Deployment (Netlify/Vercel)
1. Build the React app:
   ```bash
   cd client
   npm run build
   ```
2. Deploy the `build` folder to your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please contact the development team.

---

**Note**: This is a converted version of the original EJS-based VeeServe project to a modern MERN stack application. The functionality remains the same but with improved architecture, better user experience, and modern development practices.
