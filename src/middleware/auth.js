'use strict';

// Required modules
import jwt from 'jsonwebtoken';
import { User } from '../component.js';

const auth = async (req, res, next) => {
    try {        
        const token = await req.header('Authorization').replace('Bearer ', '');
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.find({_id: verifyToken._id, 'tokens.token': token});  
        
        if (!user) {
            res.status(400).send({error: 'Invalid token!'});
        }

        req.id = verifyToken._id;
        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({error: 'Please authenticate'})
    }
};

export { auth };