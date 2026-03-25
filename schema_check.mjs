const supabaseUrl = 'https://jxfgzufxnwnzoceeyaou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4Zmd6dWZ4bnduem9jZWV5YW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTM5NzQsImV4cCI6MjA4OTU4OTk3NH0.fjoClcVyb4jGYg_dYLvfPfADBJF1eC0B0YIcSD0SSKM';

async function checkSchema() {
  const url = `${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
        console.error("HTTP Error", response.status);
    }
    const data = await response.json();
    console.log(JSON.stringify(data.definitions.stats_turma.properties.aluno_id, null, 2));
    console.log(JSON.stringify(data.definitions.rankings_global?.properties?.aluno_id, null, 2));
    console.log(JSON.stringify(data.definitions.resultados_prova?.properties?.aluno_id, null, 2));
    console.log(JSON.stringify(data.definitions.student_activity?.properties?.aluno_id, null, 2));
  } catch(e) {
    console.error(e);
  }
}
checkSchema();
