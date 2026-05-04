import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import jwt from 'jsonwebtoken';

describe('Auth API', () => {
    it('should return 401 if no token is provided to /auth/me', async () => {
        const response = await request(app).get('/auth/me');
        expect(response.status).toBe(401);
    });

    it('should return user info if valid token is provided', async () => {
        // Create mock user
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            googleId: '123456789',
            role: 'student'
        });

        // Sign a token for the mock user
        const token = jwt.sign(
            { id: user._id.toString(), role: user.role },
            process.env.JWT_SECRET || 'test_secret'
        );

        const response = await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Test User');
        expect(response.body.email).toBe('test@example.com');
    });

    it('should clear cookie on /auth/logout', async () => {
        const response = await request(app).post('/auth/logout');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Logged out');
    });
});
