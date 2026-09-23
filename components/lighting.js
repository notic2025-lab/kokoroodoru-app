'use strict';
/* Time chooses a presentation, not an ambient-light or tracking measurement. */
(function (root) {
  const TIME_ZONE = 'Asia/Tokyo';
  const DAY_START = 6 * 60;
  const NIGHT_START = 18 * 60;
  const formatter = new Intl.DateTimeFormat('en-GB', {timeZone:TIME_ZONE,hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  function minutesAt(date = new Date()) {
    const parts = formatter.formatToParts(date);
    return Number(parts.find(p=>p.type==='hour').value)*60 + Number(parts.find(p=>p.type==='minute').value);
  }
  function parseTime(value) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
    const [h,m]=value.split(':').map(Number); return h*60+m;
  }
  function formatTime(minutes) {return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;}
  function resolve(mode, minutes) {
    if(mode==='day'||mode==='night') return mode;
    return minutes >= DAY_START && minutes < NIGHT_START ? 'day':'night';
  }
  const api=Object.freeze({TIME_ZONE,DAY_START,NIGHT_START,minutesAt,parseTime,formatTime,resolve});
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.KokoroLighting=api;
})(typeof window==='object'?window:{});
