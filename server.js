const express=require('express');
const app=express();
const PORT=process.env.PORT||10000;
const startedAt=Date.now();
let requestCount=0;
let lastRequestAt=null;

app.use(express.json());
app.use((req,res,next)=>{requestCount++;lastRequestAt=new Date().toISOString();next()});
app.use(express.static('public'));

let next={student:4,teacher:3,class:3,attendance:4,audit:1};
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
const auditLogs=[];

const allUsers=()=>[
{id:99,name:'System Admin',email:'admin@demo.local',password:'Admin@123',role:'ADMIN'}
].concat(students.map(x=>({...x,role:'STUDENT'})),teachers.map(x=>({...x,role:'TEACHER'})));

function user(req){return allUsers().find(u=>u.id===Number(req.headers['x-user-id'])&&u.role===req.headers['x-user-role'])}
function requireRole(...roles){return (req,res,next)=>{const u=user(req);if(!u||!roles.includes(u.role))return res.status(403).json({message:'Access denied'});req.user=u;next()}}
function audit(actor,action,details=''){auditLogs.unshift({id:next.audit++,time:new Date().toISOString(),actor:actor?.name||'System',role:actor?.role||'SYSTEM',action,details})}
function csvEscape(v){const s=String(v??'');return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}
function sendCsv(res,filename,headers,rows){res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition',`attachment; filename="${filename}"`);res.send([headers.map(csvEscape).join(','),...rows.map(r=>r.map(csvEscape).join(','))].join('\n'))}

app.get('/health',(req,res)=>res.json({status:'ok',service:'smart-attendance',uptimeSeconds:Math.floor((Date.now()-startedAt)/1000)}));

app.get('/api/login-demo',(req,res)=>res.json({student:'student@demo.local',teacher:'teacher@demo.local',admin:'admin@demo.local'}));
app.post('/api/login',(req,res)=>{
 const u=allUsers().find(x=>x.email===req.body?.email&&x.password===req.body?.password);
 if(!u)return res.status(401).json({message:'Invalid email or password'});
 const {password,...safe}=u; audit(u,'LOGIN','Successful login'); res.json(safe);
});

function studentRows(studentId){return attendance.filter(a=>a.studentId===studentId).map(a=>({...a,className:classes.find(c=>c.id===a.classId)?.name||'',subject:classes.find(c=>c.id===a.classId)?.subject||''}));}
function percentage(rows){const p=rows.filter(a=>a.status==='PRESENT').length;return rows.length?Math.round(p/rows.length*100):0}

app.get('/api/student/attendance',requireRole('STUDENT'),(req,res)=>{
 const rows=studentRows(req.user.id);
 const subjectMap={};
 rows.forEach(r=>{subjectMap[r.subject]??={subject:r.subject,total:0,present:0};subjectMap[r.subject].total++;if(r.status==='PRESENT')subjectMap[r.subject].present++});
 const subjects=Object.values(subjectMap).map(x=>({...x,percentage:Math.round(x.present/x.total*100)}));
 const dates=[...new Set(rows.map(r=>r.date))].sort();
 const trend=dates.map(date=>{const day=rows.filter(r=>r.date===date);return {date,present:day.filter(r=>r.status==='PRESENT').length,total:day.length,percentage:percentage(day)}});
 const present=rows.filter(a=>a.status==='PRESENT').length;
 res.json({rows,present,total:rows.length,percentage:rows.length?Math.round(present/rows.length*100):0,lowAttendance:rows.length>0&&percentage(rows)<75,subjects,trend,threshold:75});
});

app.get('/api/student/attendance.csv',requireRole('STUDENT'),(req,res)=>{
 const rows=studentRows(req.user.id);
 sendCsv(res,'my-attendance.csv',['Date','Class','Subject','Status'],rows.map(r=>[r.date,r.className,r.subject,r.status]));
});

app.get('/api/admin/data',requireRole('ADMIN'),(req,res)=>{
 const subjectMap={};
 attendance.forEach(a=>{const c=classes.find(x=>x.id===a.classId);if(!c)return;subjectMap[c.subject]??={subject:c.subject,total:0,present:0};subjectMap[c.subject].total++;if(a.status==='PRESENT')subjectMap[c.subject].present++});
 const overall=percentage(attendance);
 const lowStudents=students.map(s=>{const rows=studentRows(s.id);return {...s,total:rows.length,percentage:percentage(rows),lowAttendance:rows.length>0&&percentage(rows)<75}}).filter(s=>s.lowAttendance);
 res.json({students,teachers,classes,attendance,overallPercentage:overall,subjectAnalytics:Object.values(subjectMap).map(x=>({...x,percentage:Math.round(x.present/x.total*100)})),lowStudents,threshold:75});
});

app.post('/api/admin/students',requireRole('ADMIN'),(req,res)=>{
 const {name,email,password='Student@123',rollNo,department='CSE',semester=6}=req.body||{};
 if(!name||!email||!rollNo)return res.status(400).json({message:'Name, email and roll number are required'});
 if(allUsers().some(u=>u.email===email)||students.some(s=>s.rollNo===rollNo))return res.status(409).json({message:'Email or roll number already exists'});
 const s={id:next.student++,name,email,password,rollNo,department,semester:Number(semester)};students.push(s);audit(req.user,'ADD_STUDENT',`${name} (${rollNo})`);res.status(201).json(s);
});
app.delete('/api/admin/students/:id',requireRole('ADMIN'),(req,res)=>{
 const id=Number(req.params.id);const i=students.findIndex(s=>s.id===id);if(i<0)return res.status(404).json({message:'Student not found'});
 const removed=students[i];students.splice(i,1);for(let i=attendance.length-1;i>=0;i--)if(attendance[i].studentId===id)attendance.splice(i,1);audit(req.user,'REMOVE_STUDENT',removed.name);res.json({message:'Student removed'});
});

app.post('/api/admin/teachers',requireRole('ADMIN'),(req,res)=>{
 const {name,email,password='Teacher@123',employeeNo,department='CSE'}=req.body||{};
 if(!name||!email||!employeeNo)return res.status(400).json({message:'Name, email and employee number are required'});
 if(allUsers().some(u=>u.email===email)||teachers.some(t=>t.employeeNo===employeeNo))return res.status(409).json({message:'Email or employee number already exists'});
 const t={id:next.teacher++,name,email,password,employeeNo,department};teachers.push(t);audit(req.user,'ADD_TEACHER',`${name} (${employeeNo})`);res.status(201).json(t);
});
app.delete('/api/admin/teachers/:id',requireRole('ADMIN'),(req,res)=>{
 const id=Number(req.params.id);const i=teachers.findIndex(t=>t.id===id);if(i<0)return res.status(404).json({message:'Teacher not found'});
 const removed=teachers[i];teachers.splice(i,1);classes.forEach(c=>{if(c.teacherId===id)c.teacherId=null});audit(req.user,'REMOVE_TEACHER',removed.name);res.json({message:'Teacher removed'});
});

app.post('/api/admin/classes',requireRole('ADMIN'),(req,res)=>{
 const {name,subject,teacherId}=req.body||{};if(!name||!subject)return res.status(400).json({message:'Class and subject are required'});
 const c={id:next.class++,name,subject,teacherId:teacherId?Number(teacherId):null};classes.push(c);audit(req.user,'ADD_CLASS',`${name} — ${subject}`);res.status(201).json(c);
});
app.delete('/api/admin/classes/:id',requireRole('ADMIN'),(req,res)=>{
 const id=Number(req.params.id);const i=classes.findIndex(c=>c.id===id);if(i<0)return res.status(404).json({message:'Class not found'});
 const removed=classes[i];classes.splice(i,1);for(let i=attendance.length-1;i>=0;i--)if(attendance[i].classId===id)attendance.splice(i,1);audit(req.user,'REMOVE_CLASS',removed.name);res.json({message:'Class removed'});
});

app.get('/api/admin/audit',requireRole('ADMIN'),(req,res)=>res.json({rows:auditLogs.slice(0,100)}));
app.get('/api/admin/attendance.csv',requireRole('ADMIN'),(req,res)=>{
 const rows=attendance.map(a=>{const s=students.find(x=>x.id===a.studentId);const c=classes.find(x=>x.id===a.classId);return [a.date,s?.rollNo||'',s?.name||'',c?.name||'',c?.subject||'',a.status]});
 sendCsv(res,'attendance-report.csv',['Date','Roll No','Student','Class','Subject','Status'],rows);
});

app.get('/api/teacher/data',requireRole('TEACHER'),(req,res)=>{
 const myClasses=classes.filter(c=>c.teacherId===req.user.id);
 const analytics=myClasses.map(c=>{const rows=attendance.filter(a=>a.classId===c.id);return {...c,totalRecords:rows.length,present:rows.filter(a=>a.status==='PRESENT').length,percentage:percentage(rows)}});
 const lowStudents=students.map(s=>{const rows=attendance.filter(a=>a.studentId===s.id&&myClasses.some(c=>c.id===a.classId));return {...s,total:rows.length,percentage:percentage(rows)}}).filter(s=>s.total>0&&s.percentage<75);
 res.json({classes:myClasses,students,analytics,lowStudents,threshold:75});
});
app.get('/api/teacher/attendance.csv',requireRole('TEACHER'),(req,res)=>{
 const myClassIds=classes.filter(c=>c.teacherId===req.user.id).map(c=>c.id);
 const rows=attendance.filter(a=>myClassIds.includes(a.classId)).map(a=>{const s=students.find(x=>x.id===a.studentId);const c=classes.find(x=>x.id===a.classId);return [a.date,s?.rollNo||'',s?.name||'',c?.name||'',c?.subject||'',a.status]});
 sendCsv(res,'teacher-attendance.csv',['Date','Roll No','Student','Class','Subject','Status'],rows);
});
app.post('/api/teacher/attendance',requireRole('TEACHER'),(req,res)=>{
 const {classId,date,records}=req.body||{};const c=classes.find(x=>x.id===Number(classId)&&x.teacherId===req.user.id);
 if(!c||!date||!Array.isArray(records))return res.status(400).json({message:'Invalid class, date or records'});
 records.forEach(r=>{
   const sid=Number(r.studentId);if(!students.some(s=>s.id===sid))return;
   const status=['PRESENT','ABSENT'].includes(r.status)?r.status:'ABSENT';
   const old=attendance.find(a=>a.classId===c.id&&a.studentId===sid&&a.date===date);
   if(old)old.status=status;else attendance.push({id:next.attendance++,date,classId:c.id,studentId:sid,status});
 });
 audit(req.user,'MARK_ATTENDANCE',`${c.name} on ${date}`);
 res.json({message:'Attendance saved successfully'});
});

app.get('/api/devops/status',requireRole('ADMIN','TEACHER','STUDENT'),(req,res)=>{
 const mem=process.memoryUsage();
 res.json({
   service:'Smart Attendance',
   status:'HEALTHY',
   uptimeSeconds:Math.floor((Date.now()-startedAt)/1000),
   uptimeText:new Date((Date.now()-startedAt)).toISOString().substr(11,8),
   requestCount,lastRequestAt,
   nodeVersion:process.version,
   environment:process.env.RENDER?'Render':'Local/Docker',
   commit:process.env.RENDER_GIT_COMMIT||'local',
   memoryMB:Math.round(mem.rss/1024/1024),
   counts:{students:students.length,teachers:teachers.length,classes:classes.length,attendance:attendance.length,auditLogs:auditLogs.length},
   pipeline:[
    {name:'Code',status:'DONE',detail:'GitHub repository'},
    {name:'Test',status:'DONE',detail:'npm test'},
    {name:'Docker',status:'DONE',detail:'Docker image build'},
    {name:'Deploy',status:'DONE',detail:'Render web service'},
    {name:'Monitor',status:'ACTIVE',detail:'/health + runtime metrics'}
   ],
   repository:'https://github.com/247r1a05c2-b/smart-attendance-devops',
   actions:'https://github.com/247r1a05c2-b/smart-attendance-devops/actions'
 });
});

app.listen(PORT,'0.0.0.0',()=>console.log('Smart Attendance running on port '+PORT));
