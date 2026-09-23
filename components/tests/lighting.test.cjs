const assert=require('node:assert/strict');
const {test}=require('node:test');
const light=require('../lighting.js');
test('Japan day/night boundaries include 06:00 and exclude 18:00',()=>{
  for(const [clock,expected] of [['00:00','night'],['05:59','night'],['06:00','day'],['12:00','day'],['17:59','day'],['18:00','night'],['23:59','night']]) {
    assert.equal(light.resolve('auto',light.parseTime(clock)),expected,clock);
  }
});
test('venue clock uses Japan date/time regardless of browser timezone',()=>{
  assert.equal(light.minutesAt(new Date('2026-09-23T20:59:00Z')),359);
  assert.equal(light.minutesAt(new Date('2026-09-23T21:00:00Z')),360);
  assert.equal(light.minutesAt(new Date('2026-09-23T08:59:00Z')),1079);
  assert.equal(light.minutesAt(new Date('2026-09-23T09:00:00Z')),1080);
  assert.equal(light.minutesAt(new Date('2026-09-23T15:00:00Z')),0);
});
test('manual preference survives time changes',()=>{
  for(const minute of [0,359,360,1079,1080,1439]) {
    assert.equal(light.resolve('day',minute),'day');
    assert.equal(light.resolve('night',minute),'night');
  }
});
test('invalid or empty time cannot silently select a mode',()=>{
  for(const value of ['', '24:00','12:60','5:00','invalid']) assert.equal(light.parseTime(value),null);
  assert.equal(light.formatTime(0),'00:00');
  assert.equal(light.formatTime(1080),'18:00');
});
