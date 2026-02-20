// src/lib/disciplineEngine.js 
 
 export function getStartOfWeek(date = new Date()) { 
   const d = new Date(date); 
   const day = d.getDay(); 
   const diff = d.getDate() - day; 
   return new Date(d.setDate(diff)); 
 } 
 
 export function getWeeklyDisciplineData(userData) { 
   const sessions = userData.todaySessions || []; 
   const integrityStats = userData.integrityStats?.weekly || {}; 
   const dailyGoal = userData.dailyGoal || 0; 
 
   const startOfWeek = getStartOfWeek(); 
   let completed = 0; 
   let weeklyFocusMinutes = 0; 
 
   sessions.forEach((s) => { 
     const sessionDate = new Date(s.timestamp); 
     if (sessionDate >= startOfWeek && s.completed) { 
       completed++; 
       weeklyFocusMinutes += s.duration || 0; 
     } 
   }); 
 
   const weeklyTarget = dailyGoal * 7; 
 
   const goalCompletion = weeklyTarget 
     ? Math.min((completed / weeklyTarget) * 100, 100) 
     : 0; 
 
   const integrityBase = 
     (integrityStats.completed || 0) + 
     (integrityStats.cancelled || 0) + 
     (integrityStats.resets || 0) + 
     (integrityStats.exits || 0); 
 
   const integrity = integrityBase 
     ? ((integrityStats.completed || 0) / integrityBase) * 100 
     : 100; 
 
   const disciplineScore = 
     goalCompletion * 0.6 + integrity * 0.4; 
 
   return { 
     completed, 
     weeklyFocusMinutes, 
     goalCompletion: Math.round(goalCompletion), 
     integrity: Math.round(integrity), 
     disciplineScore: Math.round(disciplineScore) 
   }; 
 } 
