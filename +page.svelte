<script> 
  import { onMount } from 'svelte'; 
  import { auth, db } from '$lib/firebase'; 
  import { doc, getDoc } from 'firebase/firestore'; 
  import { getWeeklyDisciplineData } from '$lib/disciplineEngine'; 
 
  let scoreData = null; 
 
  onMount(async () => { 
    const user = auth.currentUser; 
    if (!user) return; 
 
    const snap = await getDoc(doc(db, 'users', user.uid)); 
    const data = snap.data(); 
    scoreData = getWeeklyDisciplineData(data); 
  }); 
</script> 
 
{#if scoreData} 
<div class="score-container"> 
  <h1>Weekly Discipline</h1> 
 
  <div class="main-score"> 
    {scoreData.disciplineScore}% 
  </div> 
 
  <div class="grid"> 
    <div class="card"> 
      <h3>Integrity</h3> 
      <p>{scoreData.integrity}%</p> 
    </div> 
 
    <div class="card"> 
      <h3>Goal Completion</h3> 
      <p>{scoreData.goalCompletion}%</p> 
    </div> 
 
    <div class="card"> 
      <h3>Sessions</h3> 
      <p>{scoreData.completed}</p> 
    </div> 
 
    <div class="card"> 
      <h3>Focus Minutes</h3> 
      <p>{scoreData.weeklyFocusMinutes}</p> 
    </div> 
  </div> 
</div> 
{/if} 
 
<style> 
.score-container { 
  padding: 2rem; 
  color: #e2e8f0; 
} 
 
h1 { 
  margin-bottom: 2rem; 
} 
 
.main-score { 
  font-size: 4rem; 
  font-weight: 700; 
  margin-bottom: 2rem; 
} 
 
.grid { 
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: 1rem; 
} 
 
.card { 
  background: #0f172a; 
  padding: 1rem; 
  border-radius: 10px; 
  border: 1px solid #1e293b; 
} 
</style> 
