'use strict';

// Required modules
import express from 'express';
import { auth, User } from '../component.js';
const userRouter = express.Router();

// create / write into db
userRouter.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateToken();

        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send(e.message);
    }
});

// login using email and password
userRouter.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken();
        
        // errors not thrown as expected.

        res.send({user, token})
    } catch (e) {
        res.status(400).send()
    }
});

// logout from a session
userRouter.post('/users/logout', auth, async (req, res) => {
    try {
        const user = await User.findById(req.id);
        user.tokens = user.tokens.filter((token) => token.token !== req.token);

        await user.save();
        res.send('Logged out successfully!');
    } catch (e) {
        res.status(500).send();
    }
});

// logout from all session
userRouter.post('/users/logoutAll', auth, async (req, res) => {
    const user = await User.findById(req.id);
    try {
        user.tokens = [];

        user.save();
        res.send('Logged out successfully from all sessions!');
    } catch (e) {
        res.status(500).send();
    }
});

// read from db
userRouter.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
});

// update db
userRouter.patch('/users/me', auth, async (req, res) => {
    // checks if update keys conforms to model's before overwriting
    const validKeys = ['name', 'age', 'email', 'password'];
    const updateKeys = Object.keys(req.body);
    const validateKeys = updateKeys.every((key) => validKeys.includes(key));

    // update keys does not conform to model's
    if (!validateKeys) {
        return res.status(400).send({
            error: 'Invalid field(s) for update!',
            fields: validKeys
        });
    }
    
    try {    
        const user = await User.findById(req.id);        
        // Keys looped to be updated. For loop used to accommodate middleware -bcrypt.
        // drawback: validation does not take effect has stated in the model.
        // Method "findByIdAndUpdate" would have been used.
        updateKeys.forEach((update) => user[update] = req.body[update]);

        await user.save();
        res.send(user);
    }   catch (e) {
        res.status(400).send(e.message);
    }
});

userRouter.delete('/users/me', auth, async (req, res) => {
    try {
        await User.deleteOne({_id: req.id});
        res.send();
    } catch (e) {
        res.status(500).send(e.message);
    }
});

export { userRouter };