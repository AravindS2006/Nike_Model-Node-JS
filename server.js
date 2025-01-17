const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); //Enable Cross-Origin Resource Sharing
const bcrypt = require('bcrypt'); // For password hashing
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory user store (replace with database in a real app)
const users = [];

//Register Endpoint
app.post('/register', async (req, res) => {
    const {username, password, email} = req.body;

    //Check if username or email already exists
    if(users.find(user => user.username === username) || users.find(user => user.email === email)){
        return res.status(400).json({message: "Username or email already exists!"});
    }

    //Validate user inputs
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({id: users.length + 1, username, password: hashedPassword, email});
        return res.status(201).json({message: "User registered successfully!"});

    } catch(err){
        return res.status(500).json({message: "Error during registration: " + err.message})
    }
});

//Login Endpoint
app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const user = users.find(user => user.username === username);

    if(!user) {
        return res.status(401).json({message: "Invalid credentials!"});
    }

    try {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(passwordMatch){
            return res.status(200).json({message: "Login Successful"});
        }
        return res.status(401).json({message: "Invalid credentials!"});

    } catch(err) {
        return res.status(500).json({message: "Error during login " + err.message});
    }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});