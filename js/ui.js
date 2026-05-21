export function renderSymptoms(symptoms,selected,toggle){

const container=document.getElementById('symptomList');

container.innerHTML=symptoms.map(symptom=>`
<div class="symptom ${selected.has(symptom.id)?'selected':''}" data-id="${symptom.id}">
<h3>${symptom.label}</h3>
<p>${symptom.summary}</p>
</div>
`).join('');

container.querySelectorAll('.symptom').forEach(el=>{
el.addEventListener('click',()=>toggle(el.dataset.id));
});

}

export function renderResults(symptoms){

const results=document.getElementById('results');

results.innerHTML=symptoms.map(symptom=>`
<div class="card">
<h2>${symptom.label}</h2>
${symptom.steps.map(step=>`<p>• ${step}</p>`).join('')}
</div>
`).join('');

}