# LifeLink Backend

This is the backend API for the LifeLink blood donation and request management system.

## Setup Instructions

### 1. Install MySQL and Create Database

- Install MySQL on your system if not already installed
- Open MySQL Workbench or use the MySQL command line
- Run the schema.sql file located in `src/config/schema.sql` to create the database and tables

Using MySQL Command Line:
```bash
mysql -u root -p < src/config/schema.sql
```

Using MySQL Workbench:
- Open MySQL Workbench
- Connect to your MySQL server
- Open the `src/config/schema.sql` file
- Execute the script to create the `lifelink_db` database and all required tables

### 2. Configure Environment Variables

- Open the `.env` file in the backend folder
- Fill in the `DB_PASSWORD` field with your MySQL root password
- The other variables are pre-configured but can be adjusted if needed

Example `.env` file:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=lifelink_db
JWT_SECRET=lifelink_jwt_secret_key_change_in_production
CLIENT_URL=http://127.0.0.1:5500
```

### 3. Install Dependencies

- Open a terminal/command prompt
- Navigate to the backend folder
- Run the following command:

```bash
npm install
```

### 4. Start the Server

- In the backend folder, run:

```bash
npm run dev
```

This will start the server using nodemon for auto-restart during development. For production, use `npm start`.

The server will start on port 5000 and you should see:
```
LifeLink API server running on port 5000
```

### 5. Run the Frontend

- Open the frontend HTML files in a browser using Live Server in VS Code
- Make sure Live Server is pointed at port 5500 (or update CLIENT_URL in .env if using a different port)

## Connecting Frontend to Backend

The frontend currently uses localStorage as the data layer. To connect it to this backend API, you need to replace the localStorage operations with fetch calls to the corresponding API endpoints.

### Authentication Example

**Current frontend code (in auth.js):**
```javascript
const user = DB.findUserByEmail(email);
if (user && user.password === password) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.role === 'donor') {
        window.location.href = 'donor-dashboard.html';
    } else {
        window.location.href = 'patient-dashboard.html';
    }
}
```

**Updated code to use backend API:**
```javascript
fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
})
.then(response => response.json())
.then(data => {
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'donor') {
            window.location.href = 'donor-dashboard.html';
        } else {
            window.location.href = 'patient-dashboard.html';
        }
    } else {
        alert(data.message || 'Login failed');
    }
})
.catch(error => {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
});
```

### API Endpoint Reference

#### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/profile` - Get user profile (requires auth)

#### Donor Endpoints
- `GET /api/donor/dashboard` - Get donor dashboard data (requires auth, donor role)
- `PUT /api/donor/donation-info` - Update donation information (requires auth, donor role)
- `PUT /api/donor/availability` - Toggle availability status (requires auth, donor role)
- `GET /api/donor/history` - Get donation history (requires auth, donor role)

#### Patient Endpoints
- `GET /api/patient/my-requests` - Get patient's blood requests (requires auth, patient role)
- `POST /api/patient/request` - Submit a blood request (requires auth, patient role)
- `GET /api/patient/donors?bloodGroup=A+&city=NewYork&availability=available` - Find donors (requires auth, patient role)

#### Admin Endpoints
- `GET /api/admin/donors` - Get all donors (requires auth, admin role)
- `GET /api/admin/patients` - Get all patients (requires auth, admin role)
- `GET /api/admin/stats` - Get system statistics (requires auth, admin role)
- `PUT /api/admin/block/:id` - Block a user (requires auth, admin role)
- `DELETE /api/admin/user/:id` - Delete a user (requires auth, admin role)

#### Request Management Endpoints
- `GET /api/requests` - Get all blood requests (requires auth, admin role)
- `GET /api/requests/:id` - Get specific blood request (requires auth, admin role)
- `PUT /api/requests/:id/status` - Update request status (requires auth, admin role)
- `DELETE /api/requests/:id` - Delete a request (requires auth, admin role)

#### Chatbot Endpoint
- `POST /api/chatbot/reply` - Get chatbot response (requires auth)

#### Contact Endpoint
- `POST /api/contact/submit` - Submit contact form (public, no auth required)

### Making Authenticated Requests

For endpoints that require authentication, include the JWT token in the Authorization header:

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/donor/dashboard', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => {
    // Handle response
});
```

### General Pattern for Replacing localStorage Operations

1. **Read operations** - Replace `DB.getSomething()` with `fetch('GET endpoint')`
2. **Write operations** - Replace `DB.saveSomething()` with `fetch('POST/PUT endpoint', { method: 'POST/PUT', body: JSON.stringify(data) })`
3. **Delete operations** - Replace `DB.deleteSomething()` with `fetch('DELETE endpoint', { method: 'DELETE' })`
4. **Always include the token** in the Authorization header for protected routes
5. **Handle errors** appropriately with try-catch or .catch()
6. **Parse JSON responses** using `.then(response => response.json())`

## API Response Format

All API responses return JSON:

**Success Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "donor",
    "full_name": "John Doe"
  }
}
```

**Error Response:**
```json
{
  "message": "Error message here"
}
```

## Troubleshooting

- **Connection refused**: Ensure MySQL server is running and credentials in .env are correct
- **Database not found**: Run the schema.sql file to create the database
- **Port already in use**: Change PORT in .env file
- **CORS errors**: Ensure CLIENT_URL in .env matches your frontend URL

## Security Notes

- Change the JWT_SECRET in .env before deploying to production
- The admin password is currently in plain text - hash it in production
- Use environment variables for all sensitive configuration
- Enable HTTPS in production
- Implement rate limiting for API endpoints
