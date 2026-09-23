import { PrismaClient, Role, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (p: string) => bcrypt.hashSync(p, 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: { passwordHash: hash('Admin@123'), active: true },
    create: { email: 'admin@demo.local', passwordHash: hash('Admin@123'), name: 'System Admin', role: Role.ADMIN }
  });
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@demo.local' },
    update: { passwordHash: hash('Teacher@123'), active: true },
    create: { email: 'teacher@demo.local', passwordHash: hash('Teacher@123'), name: 'Demo Teacher', role: Role.TEACHER }
  });
  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id }, update: {},
    create: { userId: teacherUser.id, employeeNo: 'T001', department: 'Computer Science' }
  });
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@demo.local' },
    update: { passwordHash: hash('Student@123'), active: true },
    create: { email: 'student@demo.local', passwordHash: hash('Student@123'), name: 'Demo Student', role: Role.STUDENT }
  });
  const student = await prisma.student.upsert({
    where: { userId: studentUser.id }, update: {},
    create: { userId: studentUser.id, rollNo: 'CSE001', department: 'Computer Science', semester: 6 }
  });
  const class1 = await prisma.class.upsert({
    where: { name: 'CSE-6A' }, update: {},
    create: { name: 'CSE-6A', department: 'Computer Science', semester: 6 }
  });
  await prisma.enrollment.upsert({
    where: { studentId_classId: { studentId: student.id, classId: class1.id } }, update: {},
    create: { studentId: student.id, classId: class1.id }
  });
  const subjects = [['DEV101','DevOps Engineering'],['DB101','Database Systems'],['CN101','Computer Networks'],['OS101','Operating Systems']];
  for (const [code,name] of subjects) {
    await prisma.subject.upsert({
      where: { code }, update: { name, classId: class1.id, teacherId: teacher.id },
      create: { code, name, classId: class1.id, teacherId: teacher.id }
    });
  }
  const allSubjects = await prisma.subject.findMany({ where: { classId: class1.id } });
  for (let i = 0; i < 28; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (27 - i));
    for (const s of allSubjects) {
      const status = i % 7 === 2 ? AttendanceStatus.ABSENT : (i % 11 === 0 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT);
      await prisma.attendance.upsert({
        where: { studentId_subjectId_date: { studentId: student.id, subjectId: s.id, date } },
        update: { status },
        create: { studentId: student.id, classId: class1.id, subjectId: s.id, teacherId: teacher.id, date, status }
      });
    }
  }
  await prisma.auditLog.create({ data: { userId: admin.id, action: 'SEED', entity: 'SYSTEM', details: 'Demo data initialized' } });
  console.log('Seed complete.');
}
main().finally(() => prisma.$disconnect());
