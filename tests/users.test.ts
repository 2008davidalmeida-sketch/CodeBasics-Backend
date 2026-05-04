import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import jwt from 'jsonwebtoken';

describe('Users API', () => {
    let studentToken: string;
    let teacherToken: string;

    beforeEach(async () => {
        const student = await User.create({
            name: 'Student 1',
            email: 'student1@example.com',
            googleId: '111',
            role: 'student'
        });
        studentToken = jwt.sign({ id: student._id.toString(), role: student.role }, process.env.JWT_SECRET || 'test_secret');

        const teacher = await User.create({
            name: 'Teacher 1',
            email: 'teacher1@example.com',
            googleId: '222',
            role: 'teacher'
        });
        teacherToken = jwt.sign({ id: teacher._id.toString(), role: teacher.role }, process.env.JWT_SECRET || 'test_secret');
    });

    it('should block students from fetching all students', async () => {
        const response = await request(app)
            .get('/users/students')
            .set('Authorization', `Bearer ${studentToken}`);
        expect(response.status).toBe(403);
    });

    it('should allow teachers to fetch all students', async () => {
        const response = await request(app)
            .get('/users/students')
            .set('Authorization', `Bearer ${teacherToken}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(1); // Only 1 student created, since the other is a teacher
        expect(response.body.pagination.total).toBe(1);
        expect(response.body.data[0].name).toBe('Student 1');
    });
});
