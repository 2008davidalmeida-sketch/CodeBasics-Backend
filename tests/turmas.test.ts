import request from 'supertest';
import app from '../src/app';
import Turma from '../src/models/Turma';
import User from '../src/models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('Turmas API', () => {
    let studentToken: string;
    let teacherToken: string;
    let otherTeacherToken: string;

    let studentId: string;
    let teacherId: string;
    let otherTeacherId: string;

    beforeEach(async () => {
        // Setup users for these tests
        const student = await User.create({
            name: 'Turma Student',
            email: 'student_turma@example.com',
            googleId: 'google_student_1',
            role: 'student'
        });
        studentId = student._id.toString();
        studentToken = jwt.sign(
            { id: studentId, role: student.role },
            process.env.JWT_SECRET || 'test_secret'
        );

        const teacher = await User.create({
            name: 'Turma Teacher',
            email: 'teacher_turma@example.com',
            googleId: 'google_teacher_1',
            role: 'teacher'
        });
        teacherId = teacher._id.toString();
        teacherToken = jwt.sign(
            { id: teacherId, role: teacher.role },
            process.env.JWT_SECRET || 'test_secret'
        );

        const otherTeacher = await User.create({
            name: 'Other Teacher',
            email: 'other_teacher_turma@example.com',
            googleId: 'google_teacher_2',
            role: 'teacher'
        });
        otherTeacherId = otherTeacher._id.toString();
        otherTeacherToken = jwt.sign(
            { id: otherTeacherId, role: otherTeacher.role },
            process.env.JWT_SECRET || 'test_secret'
        );
    });

    describe('POST /turmas (Create Turma)', () => {
        it('should allow a teacher to create a turma', async () => {
            const response = await request(app)
                .post('/turmas')
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ name: 'Web Dev 101' });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('Web Dev 101');
            expect(response.body.createdBy).toBe(teacherId);

            // Verify that the turma was added to the teacher's turmas array
            const updatedTeacher = await User.findById(teacherId);
            expect(updatedTeacher?.turmas.map(id => id.toString())).toContain(response.body._id);
        });

        it('should return 400 if name is missing', async () => {
            const response = await request(app)
                .post('/turmas')
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({});

            expect(response.status).toBe(400)
        });

        it('should block a student from creating a turma', async () => {
            const response = await request(app)
                .post('/turmas')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ name: 'Hacker Class' });

            // Depending on verifyRole implementation, it could be 403
            expect(response.status).toBe(403);
        });
    });

    describe('Member Management (Add / Remove)', () => {
        let turmaId: string;

        beforeEach(async () => {
            const response = await request(app)
                .post('/turmas')
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ name: 'Javascript Basics' })
            turmaId = response.body._id
        });

        it('should allow teacher to add a member', async () => {
            const response = await request(app)
                .post('/turmas/add-member')
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ turmaId, userId: studentId });

            expect(response.status).toBe(200);
            expect(response.body.members).toContain(studentId);

            // Verify the student has the turmaId in their turmas array
            const updatedStudent = await User.findById(studentId);
            expect(updatedStudent?.turmas.map(id => id.toString())).toContain(turmaId);
        });

        it('should prevent adding duplicate members', async () => {
            await request(app)
                .post('/turmas/add-member')
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ turmaId, userId: studentId });

            const response = await request(app)
                .post('/turmas/add-member')
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ turmaId, userId: studentId });

            expect(response.status).toBe(200);

            // Check that the member only exists once in the turma array
            const updatedTurma = await Turma.findById(turmaId);
            expect(updatedTurma?.members).toHaveLength(1);
        });

        it('should allow teacher to remove a member', async () => {
            // First add a member
            await request(app)
                .post('/turmas/add-member')
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ turmaId, userId: studentId });

            // Now remove them
            const response = await request(app)
                .post('/turmas/remove-member')
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ turmaId, userId: studentId });

            expect(response.status).toBe(200);
            expect(response.body.members).not.toContain(studentId);

            // Verify the student no longer has the turmaId in their turmas array
            const updatedStudent = await User.findById(studentId);
            expect(updatedStudent?.turmas).toHaveLength(0);
        });
    });

    describe('GET /turmas', () => {
        beforeEach(async () => {
            const turmaA = await Turma.create({ name: 'Class A', createdBy: teacherId });
            const turmaB = await Turma.create({ name: 'Class B', createdBy: teacherId });
            await User.findByIdAndUpdate(teacherId, {
                $push: { turmas: { $each: [turmaA._id, turmaB._id] } }
            });
        });

        it('should get all turmas for a teacher', async () => {
            const response = await request(app)
                .get('/turmas')
                .set('Authorization', `Bearer ${teacherToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
            expect(response.body.map((t: any) => t.name)).toEqual(
                expect.arrayContaining(['Class A', 'Class B'])
            );
        });
    });

    describe('GET /turmas/:id', () => {
        let turmaId: string;

        beforeEach(async () => {
            const turma = await Turma.create({
                name: 'Data Science',
                createdBy: teacherId,
                members: [studentId] // student is added manually for setup
            });
            turmaId = turma._id.toString();
            await User.findByIdAndUpdate(studentId, { $push: { turmas: turmaId } });
            await User.findByIdAndUpdate(teacherId, { $push: { turmas: turmaId } });
        });

        it('should get a single turma if requested by creator', async () => {
            const response = await request(app)
                .get(`/turmas/${turmaId}`)
                .set('Authorization', `Bearer ${teacherToken}`);

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Data Science');
            // Populated field check
            expect(response.body.createdBy._id.toString()).toBe(teacherId);
        });

        it('should get a single turma if requested by member (if role allowed)', async () => {
            // Since the router has `verifyRole('teacher')`, the student will get 403 at router level
            const response = await request(app)
                .get(`/turmas/${turmaId}`)
                .set('Authorization', `Bearer ${studentToken}`);

            expect(response.status).toBe(403);
        });

        it('should return 403 if requested by non-member non-creator teacher', async () => {
            const response = await request(app)
                .get(`/turmas/${turmaId}`)
                .set('Authorization', `Bearer ${otherTeacherToken}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Unauthorized to view this turma');
        });
    });

    describe('DELETE /turmas/:id', () => {
        let turmaId: string;

        beforeEach(async () => {
            const turma = await Turma.create({
                name: 'To Be Deleted',
                createdBy: teacherId,
                members: [studentId]
            });
            turmaId = turma._id.toString();
            // Manually add to users for setup
            await User.findByIdAndUpdate(studentId, { $push: { turmas: turmaId } });
            await User.findByIdAndUpdate(teacherId, { $push: { turmas: turmaId } });
        });

        it('should successfully delete a turma and clear it from members arrays', async () => {
            const response = await request(app)
                .delete(`/turmas/${turmaId}`)
                .set('Authorization', `Bearer ${teacherToken}`);

            expect(response.status).toBe(200);

            const deletedTurma = await Turma.findById(turmaId);
            expect(deletedTurma).toBeNull();

            // Verify references are removed from users
            const updatedStudent = await User.findById(studentId);
            expect(updatedStudent?.turmas.map(id => id.toString())).not.toContain(turmaId);

            const updatedTeacher = await User.findById(teacherId);
            expect(updatedTeacher?.turmas.map(id => id.toString())).not.toContain(turmaId);
        });
    });
});
