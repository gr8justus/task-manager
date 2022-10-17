'use strict';

// Required modules
import express from 'express'
import { User } from '../component.js'

const userRouter = express.Router();

// create / write into db
userRouter.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        const save = await user.save()
        res.status(201).send(save)
    } catch (e) {
        res.status(400).send(e.message)
    }
});

// read from db
userRouter.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
});

userRouter.get('/users/:id', async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)
        res.send(user)
    } catch (e) {
        res.status(404).send('No matching user with id: ' + id + ' found!')
    }
});

// update db
userRouter.patch('/users/:id', async (req, res) => {
    const id = req.params.id;

    // checks id length
    if (id.length < 24) {
        return res.status(400).send('id can not be less than 24 characters!');
    }

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
        const user = await User.findById(id)
        
        // Keys looped to be updated. For loop used to accommodate middleware -bcrypt.
        // drawback: validation does not take effect has stated in the model.
        // Method "findByIdAndUpdate" would have been used.
        updateKeys.forEach((update) => user[update] = req.body[update]);
        await user.save();

        // id not found
        if (!user) {
            return res.status(404).send('No matching user with id: ' + id + ' found for update!')
        }

        // user details overwritten
        res.send(user);

    }   catch (e) {
        res.status(400).send(e.message);
    }
});

userRouter.delete('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            res.status(404).send('No matching user with id: ' + id + ' found for delete!')
        }

        res.send(user)
    } catch (e) {
        res.status(400).send(e.message)
    }
});

export { userRouter }