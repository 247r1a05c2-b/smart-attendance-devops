const test=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');

let child;
let base;

test.before(async()=>{
 child=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:'18080'},stdio:'ignore'});
 base='http://127.0.0.1:18080';
 for(let i=0;i<50;i++){try{const r=await fetch(base+'/health');if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}
 throw new Error('Server did not start');
});
test.after(()=>child?.kill());

test('health endpoint is available',async()=>{
 const r=await fetch(base+'/health');assert.equal(r.status,200);const d=await r.json();assert.equal(d.status,'ok');
});
test('demo student can login',async()=>{
 const r=await fetch(base+'/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'student@demo.local',password:'Student@123'})});
 assert.equal(r.status,200);const d=await r.json();assert.equal(d.role,'STUDENT');
});
test('student attendance analysis is available',async()=>{
 const login=await fetch(base+'/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'student@demo.local',password:'Student@123'})});
 const me=await login.json();
 const r=await fetch(base+'/api/student/attendance',{headers:{'x-user-id':String(me.id),'x-user-role':me.role}});
 assert.equal(r.status,200);const d=await r.json();assert.ok(Array.isArray(d.subjects));assert.ok(Array.isArray(d.trend));
});
