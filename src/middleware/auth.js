'use strict';

// Required modules
import jwt from 'jsonwebtoken';
import { User } from '../component.js';

const auth = async (req, res, next) => {
    try {        
        const token = await req.header('Authorization').replace('Bearer ', '');
        const extractId = jwt.verify(token, 'taskmanagerapp');
        const user = await User.find({_id: extractId._id, 'tokens.token': token});  
        
        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({error: 'Please authenticate'})
    }
};

export { auth };