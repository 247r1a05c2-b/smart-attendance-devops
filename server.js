const express=require('express');
const app=express();
const PORT=process.env.PORT||10000;
app.use(express.json());
app.use(express.static('public'));

let next={student:4,teacher:3,class:3,attendance:4};
const students=[
{id:1,name:'Aarav Kumar',email:'student@demo.local',password:'Student@123',rollNo:'CSE001',department:'CSE',semester:6},
{id:2,name:'Priya Sharma',email:'priya@demo.local',password:'Student@123',rollNo:'CSE002',department:'CSE',semester:6},
{id:3,name:'Rahul Reddy',email:'rahul@demo.local',password:'Student@123',rollNo:'CSE003',department:'CSE',semester:6}
];
const teachers=[
{id:1,name:'Demo Teacher',email:'teacher@demo.local',password:'Teacher@123',employeeNo:'T001',department:'CSE'},
{id:2,name:'Anita Rao',email:'anita@demo.local',password:'Teacher@123',employeeNo:'T002',department:'CSE'}
];
const classes=[
{id:1,name:'CSE-6A',subject:'DevOps Engineering',teacherId:1},
{id:2,name:'CSE-6B',subject:'Database Systems',teacherId:2}
];
const attendance=[
{id:1,date:'2026-09-22',classId:1,studentId:1,status:'PRESENT'},
{id:2,date:'2026-09-22',classId:1,studentId:2,status:'PRESENT'},
{id:3,date:'2026-09-22',classId:1,studentId:3,status:'ABSENT'}
];

const allUsers=()=>[
{id:99,name:'System Admin',email:'admin@demo.local',password:'Admin@123',role:'ADMIN'}
].concat(students.map(x=>({...x,role:'STUDENT'})),teachers.map(x=>({...x,role:'TEACHER'})));

function user(req){return allUsers().find(u=>u.id===Number(req.headers['x-user-id'])&&u.role===req.headers['x-user-role'])}
function requireRole(...roles){return (req,res,next)=>{const u=user(req);if(!u||!roles.includes(u.role))return res.status(403).json({message:'Access denied'});req.user=u;next()}}

app.get('/health',(req,res)=>res.json({status:'ok',service:'smart-attendance'}));
app.post('/api/login',(req,res)=>{
 const u=allUsers().find(x=>x.email===req.body?.email&&x.password===req.body?.password);
 if(!u)return res.status(401).json({message:'Invalid email or password'});
 const {password,...safe}=u;res.json(safe);
});

app.get('/api/student/attendance',requireRole('STUDENT'),(req,res)=>{
 const rows=attendance.filter(a=>a.studentId===req.user.id).map(a=>({...a,className:classes.find(c=>c.id===a.classId)?.name||''}));
 const present=rows.filter(a=>a.status==='PRESENT').length;
 res.json({rows,present,total:rows.length,percentage:rows.length?Math.round(present/rows.length*100):0});
});

app.get('/api/admin/data',requireRole('ADMIN'),(req,res)=>res.json({students,teachers,classes}));
app.post('/api/admin/students',requireRole('ADMIN'),(req,res)=>{
 const {name,email,password='Student@123',rollNo,department='CSE',semester=6}=req.body||{};
 if(!name||!email||!rollNo)return res.status(400).json({message:'Name, email and roll number are required'});
 if(allUsers().some(u=>u.email===email)||students.some(s=>s.rollNo===rollNo))return res.status(409).json({message:'Email or roll number already exists'});
 const s={id:next.student++,name,email,password,rollNo,department,semester:Number(semester)};students.push(s);res.status(201).json(s);
});
app.delete('/api/admin/students/:id',requireRole('ADMIN'),(req,res)=>{
 const id=Number(req.params.id);const i=students.findIndex(s=>s.id===id);if(i<0)return res.status(404).json({message:'Student not found'});
 students.splice(i,1);for(let i=attendance.length-1;i>=0;i--)if(attendance[i].studentId===id)attendance.splice(i,1);res.json({message:'Student removed'});
});
app.post('/api/admin/teachers',requireRole('ADMIN'),(req,res)=>{
 const {name,email,password='Teacher@123',employeeNo,department='CSE'}=req.body||{};
 if(!name||!email||!employeeNo)return res.status(400).json({message:'Name, email and employee number are required'});
 if(allUsers().some(u=>u.email===email)||teachers.some(t=>t.employeeNo===employeeNo))return res.status(409).json({message:'Email or employee number already exists'});
 const t={id:next.teacher++,name,email,password,employeeNo,department};teachers.push(t);res.status(201).json(t);
});
app.delete('/api/admin/teachers/:id',requireRole('ADMIN'),(req,res)=>{
 const id=Number(req.params.id);const i=teachers.findIndex(t=>t.id===id);if(i<0)return res.status(404).json({message:'Teacher not found'});
 teachers.splice(i,1);classes.forEach(c=>{if(c.teacherId===id)c.teacherId=null});res.json({message:'Teacher removed'});
});
app.post('/api/admin/classes',requireRole('ADMIN'),(req,res)=>{
 const {name,subject,teacherId}=req.body||{};if(!name||!subject)return res.status(400).json({message:'Class and subject are required'});
 const c={id:next.class++,name,subject,teacherId:teacherId?Number(teacherId):null};classes.push(c);res.status(201).json(c);
});
app.delete('/api/admin/classes/:id',requireRole('ADMIN'),(req,res)=>{
 const id=Number(req.params.id);const i=classes.findIndex(c=>c.id===id);if(i<0)return res.status(404).json({message:'Class not found'});
 classes.splice(i,1);for(let i=attendance.length-1;i>=0;i--)if(attendance[i].classId===id)attendance.splice(i,1);res.json({message:'Class removed'});
});

app.get('/api/teacher/data',requireRole('TEACHER'),(req,res)=>{
 const myClasses=classes.filter(c=>c.teacherId===req.user.id);
 res.json({classes:myClasses,students});
});
app.post('/api/teacher/attendance',requireRole('TEACHER'),(req,res)=>{
 const {classId,date,records}=req.body||{};const c=classes.find(x=>x.id===Number(classId)&&x.teacherId===req.user.id);
 if(!c||!date||!Array.isArray(records))return res.status(400).json({message:'Invalid class, date or records'});
 records.forEach(r=>{
   const sid=Number(r.studentId);if(!students.some(s=>s.id===sid))return;
   const old=attendance.find(a=>a.classId===c.id&&a.studentId===sid&&a.date===date);
   if(old)old.status=r.status;else attendance.push({id:next.attendance++,date,classId:c.id,studentId:sid,status:r.status});
 });
 res.json({message:'Attendance saved successfully'});
});

app.listen(PORT,'0.0.0.0',()=>console.log('Smart Attendance running on port '+PORT));