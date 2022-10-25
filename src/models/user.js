// 'use strict';

// Modules required
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Houses the blueprint of user collection
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 18) {
                throw new Error('Can not access, unless you are of legal age!')
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password can not include the phrase "password"!')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

// hash password from plain text
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }

    // this method ensures the next block of code is executed
    next();
});

// Custom function to handle user authentication || binds on the model -> [statics]
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login');
    }

    // checks if inputted password matches to that of db 
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
}

// custom function to handle token generation || binds on an instance of the model -> [methods]
userSchema.methods.generateToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, 'taskmanagerapp');

    this.tokens = this.tokens.concat({token});
    await this.save();

    return token;
}

// custom function to hide some object parameters
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();

    // values of parameters to be hidden
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

// Provides access to task collection from userRouter.
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

// User model declaration
const User = mongoose.model('User', userSchema);

export { User };