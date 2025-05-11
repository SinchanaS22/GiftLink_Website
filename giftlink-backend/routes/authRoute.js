import express, { Router } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult, body } from 'express-validator';
import connectToDatabase from '../models/db.js'; // Corrected path
import dotenv from 'dotenv';
import pino from 'pino';


const logger = pino();
dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Validation middleware for the registration route
const registerValidation = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
];

router.post('/register', registerValidation, async (req, res) => {
    try {
        // 1. Input validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // 2. Connect to the database
        const db = await connectToDatabase();
        const collection = db.collection('users');

        // 3. Check for existing email
        const existingUser = await collection.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already taken' });
        }

        // 4. Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(req.body.password, salt);

        // 5. Create new user object
        const newUser = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hashedPassword,
            createdAt: new Date(),
        };

        // 6. Insert the new user into the database
        const result = await collection.insertOne(newUser);

        // 7. Create JWT payload
        const payload = {
            user: {
                id: result.insertedId,
            },
        };

        // 8. Sign the JWT
        const authtoken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '1h', // Set an expiration time
        });

        // 9. Log the successful registration
        logger.info(`User registered successfully: ${req.body.email}`);
        // 10. Send the response
        res.status(201).json({ authtoken, email: req.body.email }); // Include email in response

    } catch (error) {
        // 11. Handle errors
        logger.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message }); // Include error message
    }
});

router.post('/login', async (req, res) => {
    console.log("\n\n Inside login")
    try {
        // const collection = await connectToDatabase();
        const db = await connectToDatabase();
        const collection = db.collection("users");
        const theUser = await collection.findOne({ email: req.body.email });
        if (theUser) {
            let result = await bcryptjs.compare(req.body.password, theUser.password)
            if(!result) {
                logger.error('Passwords do not match');
                return res.status(404).json({ error: 'Wrong pasword' });
            }
            let payload = {
                user: {
                    id: theUser._id.toString(),
                },
            };
            const userName = theUser.firstName;
            const userEmail = theUser.email;
            const authtoken = jwt.sign(payload, JWT_SECRET);
            logger.info('User logged in successfully');
            return res.status(200).json({ authtoken, userName, userEmail });
        } else {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (e) {
        logger.error(e);
        return res.status(500).json({ error: 'Internal server error', details: e.message });
      }
});

// update API
router.put('/update', async (req, res) => {
    // Task 2: Validate the input using `validationResult` and return approiate message if there is an error.
    const errors = validationResult(req);
    // Task 3: Check if `email` is present in the header and throw an appropriate error message if not present.
    if (!errors.isEmpty()) {
        logger.error('Validation errors in update request', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const email = req.headers.email;
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }
        //Task 4: Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("users");
        //Task 5: Find user credentials
        const existingUser = await collection.findOne({ email });
        if (!existingUser) {
            logger.error('User not found');
            return res.status(404).json({ error: "User not found" });
        }
        existingUser.firstName = req.body.name;
        existingUser.updatedAt = new Date();
        //Task 6: Update user credentials in DB
        const updatedUser = await collection.findOneAndUpdate(
            { email },
            { $set: existingUser },
            { returnDocument: 'after' }
        );
        //Task 7: Create JWT authentication with user._id as payload using secret key from .env file
        const payload = {
            user: {
                id: updatedUser._id.toString(),
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User updated successfully');
        res.json({ authtoken });
    } catch (error) {
        logger.error(error);
        return res.status(500).send("Internal Server Error");
    }
});


export default router;
