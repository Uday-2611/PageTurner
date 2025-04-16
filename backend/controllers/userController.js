import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
// ------ Used to create logic for user to create an account or login on the website ------ 

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

// ------ Route for User Login ------
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: 'User does not exist'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id);
            res.json({
                success: true,
                token,
                user: {
                    id: user._id.toString(), // Ensure consistent id field
                    name: user.name,
                    email: user.email,
                    isSeller: user.isSeller,
                    cartData: user.cartData || {} // Include cartData in response
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Incorrect password'
            });
        }
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ------ Check if user already exists ------
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({
                success: false,
                message: 'User already exists'
            })
        }

        // ------ Validating email format and strong password ------
        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: 'Please enter a valid email'
            })
        }

        if (password.length < 8) {
            return res.json({
                success: false,
                message: 'Please enter a strong password'
            })
        }

        // ------ Hashing password ------
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ------ Creating new user ------
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            isSeller: true,
            cartData: {} // Initialize empty cart
        });

        const user = await newUser.save();
        const token = createToken(user._id);
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isSeller: user.isSeller,
                cartData: user.cartData // Include cartData in response
            }
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// ------ Route for Admin Login ------
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);

            res.json({
                success: true,
                token
            })
        } else {
            res.json({
                success: false,
                message: 'Invalid email or password'
            })
        }

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

const getCurrentUser = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isSeller: user.isSeller,
                cartData: user.cartData || {}
            }
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

export { loginUser, registerUser, adminLogin, getCurrentUser };