import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, app } from '../src/component.js';
import { sum } from '../src/math.js';

const testUserId = new mongoose.Types.ObjectId();
const testUser = {
    _id: testUserId,
    name: 'test',
    age: 18,
    email: 'someone@example.com',
    password: 'signMeInASAP!',
    tokens: [{
        token: jwt.sign({_id: testUserId}, process.env.JWT_SECRET)
    }]
}

beforeEach(async () => {
    await User.deleteMany();
    await new User(testUser).save()
});

test('addition of numbers', () => {
    let result = sum(2, 5);
    expect(result).toBe(7);
});

test('create new user', async () => {
    await request( app)
        .post('/users')
        .send({
            name: 'Oluwatobi',
            email: 'oladoyeolamide@gmail.com',
            age: 27,
            password: 'kasimawo123!'
        }).expect(201);
});

test('login a user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: testUser.email,
            password: testUser.password
        }).expect(200);
    const user = await User.findById(response.body.user._id);
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('should not login non-existent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: testUser.email,
            password: 'bufalo'
        }).expect(400);
});

test('should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send()
        .expect(200);
});

test('should not get profile if not authenticated', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
}); 

test('should delete user account', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send()
        .expect(200);
    const user = await User.findById(testUserId);
    expect(user).toBeNull();
});

test('should not delete unauthenticated user account', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});

test('should upload avatar', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .attach('avatar', 'test/fixtures/avatar.png')
        .expect(200);
    const user = await User.findById(testUserId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('should update valid user fields', async () => {
    const res = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send({
            name: 'generic'
        }).expect(200);
    const user = await User.findById(testUser._id);
    expect(user.name).toEqual('generic');
});

test('should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
        .send({
            location: 'China'
        }).expect(400);
});