import request from 'supertest';
import app from '../src/app';
import Challenge from '../src/models/Challenge';
import User from '../src/models/User';
import jwt from 'jsonwebtoken';

// Mock the Gemini API so we don't make real requests to Google during testing
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockResolvedValue({
                        response: {
                            text: () => JSON.stringify({ feedback: 'Great job!', passed: true })
                        }
                    })
                })
            };
        })
    };
});

// Mock the submission queue to prevent BullMQ/ioredis-mock errors
jest.mock('../src/queues/submissionQueue', () => ({
    submissionQueue: {
        add: jest.fn().mockResolvedValue({ id: 'mock-job-id' })
    }
}));


describe('Submissions API', () => {
    let studentToken: string;
    let teacherToken: string;
    let challengeId: string;

    beforeEach(async () => {
        // Setup a user and challenge for these tests
        const student = await User.create({
            name: 'Sub User',
            email: 'sub@example.com',
            googleId: '987654321',
            role: 'student'
        });

        studentToken = jwt.sign(
            { id: student._id.toString(), role: student.role },
            process.env.JWT_SECRET || 'test_secret'
        );

        const teacher = await User.create({
            name: 'Teacher User',
            email: 'teacher@example.com',
            googleId: '123456789',
            role: 'teacher'
        });

        teacherToken = jwt.sign(
            { id: teacher._id.toString(), role: teacher.role },
            process.env.JWT_SECRET || 'test_secret'
        );

        const challenge = await Challenge.create({
            title: 'Sub Challenge',
            description: 'Test Submissions',
            topic: 'testing',
            order: 1,
            createdBy: teacher._id
        });
        challengeId = challenge._id.toString();
    });

    it('should return 401 if trying to submit without token', async () => {
        const response = await request(app).post('/submissions').send({ challengeId, code: 'print()' });
        expect(response.status).toBe(401);
    });

    it('should create a submission and return pending status', async () => {
        const response = await request(app)
            .post('/submissions')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ challengeId, code: 'print("hello")' });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('pending');
        expect(response.body.code).toBe('print("hello")');
    });

    it('should fetch user submissions', async () => {
        // Create one submission using the API
        await request(app)
            .post('/submissions')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ challengeId, code: 'print("hello")' });

        // Fetch submissions
        const response = await request(app)
            .get('/submissions/me')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(1);
        expect(response.body.pagination.total).toBe(1);
        expect(response.body.data[0].code).toBe('print("hello")');
        expect(response.body.data[0].challengeId.title).toBe('Sub Challenge'); // Populated challenge title
    });

    it('should return 404 for submitting to invalid challenge ID', async () => {
        const fakeId = '123456789012345678901234';
        const response = await request(app)
            .post('/submissions')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ challengeId: fakeId, code: 'print()' });
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Challenge not found');
    });

    it('should block students from viewing all submissions', async () => {
        const response = await request(app)
            .get('/submissions')
            .set('Authorization', `Bearer ${studentToken}`);
        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Access denied');
    });

    it('should allow teachers to view all submissions', async () => {
        const response = await request(app)
            .get('/submissions')
            .set('Authorization', `Bearer ${teacherToken}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fetch submissions for a specific challenge', async () => {
        const response = await request(app)
            .get(`/submissions/challenge/${challengeId}`)
            .set('Authorization', `Bearer ${studentToken}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
});
