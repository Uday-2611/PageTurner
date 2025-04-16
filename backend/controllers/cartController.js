import userModel from "../models/userModel.js";

// Update user cart ------
const updateCart = async (req, res, next) => {
    try {
        const { userId, cartData } = req.body;
        
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.status(200).json({ success: true, message: 'Cart Updated' });
    } catch (error) {
        next(error);
    }
}

// Get user cart data ------
const getUserCart = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId);
        
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const cartData = userData.cartData || {};
        res.status(200).json({ success: true, cartData });
    } catch (error) {
        next(error);
    }
}

// Add products to user cart ------
const addToCart = async (req, res, next) => {
    try {
        const { userId, itemId, quantity = 1 } = req.body;
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let cartData = userData.cartData || {};
        cartData[itemId] = (cartData[itemId] || 0) + quantity;

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.status(201).json({ success: true, message: 'Added to cart', cartData });
    } catch (error) {
        next(error);
    }
}

export { addToCart, updateCart, getUserCart }