import request from 'supertest';
import app from '../src/app';
import Challenge from '../src/models/Challenge';
import User from '../src/models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('Challenges API', () => {
    let studentToken: string;
    let teacherToken: string;
    let challengeId: string;

    beforeEach(async () => {
        const student = await User.create({
            name: 'Student User',
            email: 'student@example.com',
            googleId: '111',
            role: 'student'
        });
        studentToken = jwt.sign({ id: student._id.toString(), role: student.role }, process.env.JWT_SECRET || 'test_secret');

        const teacher = await User.create({
            name: 'Teacher User',
            email: 'teacher@example.com',
            googleId: '222',
            role: 'teacher'
        });
        teacherToken = jwt.sign({ id: teacher._id.toString(), role: teacher.role }, process.env.JWT_SECRET || 'test_secret');

        const challenge = await Challenge.create({
            title: 'Test Challenge',
            description: 'A test challenge description',
            topic: 'testing',
            order: 1,
            starterCode: 'function test() {}',
            createdBy: teacher._id
        });
        challengeId = challenge._id.toString();
    });

    it('should fetch a list of challenges', async () => {
        const response = await request(app).get('/challenges');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(1);
    });

    it('should fetch a single challenge by ID', async () => {
        const response = await request(app).get(`/challenges/${challengeId}`);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Test Challenge');
    });

    it('should block students from creating a challenge', async () => {
        const response = await request(app)
            .post('/challenges')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                title: 'New Challenge',
                description: 'desc',
                topic: 'test',
                order: 2,
                createdBy: new mongoose.Types.ObjectId()
            });
        expect(response.status).toBe(403);
    });

    it('should allow teachers to create a challenge', async () => {
        const response = await request(app)
            .post('/challenges')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                title: 'New Challenge',
                description: 'desc',
                topic: 'test',
                order: 2
            });
        expect(response.status).toBe(201);
        expect(response.body.title).toBe('New Challenge');
    });

    it('should allow teachers to update a challenge', async () => {
        const response = await request(app)
            .put(`/challenges/${challengeId}`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                title: 'Updated Challenge Title'
            });
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Updated Challenge Title');
    });

    it('should allow teachers to delete a challenge', async () => {
        const response = await request(app)
            .delete(`/challenges/${challengeId}`)
            .set('Authorization', `Bearer ${teacherToken}`);
        expect(response.status).toBe(200);

        // Verify it's gone
        const fetchResponse = await request(app).get(`/challenges/${challengeId}`);
        expect(fetchResponse.status).toBe(404);
    });
});
