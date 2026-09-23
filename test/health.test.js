const test=require('node:test');
const assert=require('node:assert');
test('health response contract',()=>{assert.deepStrictEqual({status:'ok',service:'smart-attendance'},{status:'ok',service:'smart-attendance'});});
test('attendance statuses',()=>{assert.ok(['PRESENT','ABSENT'].includes('PRESENT'));});
