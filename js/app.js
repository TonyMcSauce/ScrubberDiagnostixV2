import {SYMPTOMS} from './data.js';
import {renderSymptoms,renderResults} from './ui.js';
import './sw-register.js';

const selected=new Set();

const fab=document.getElementById('mobileFab');
const sidebar=document.getElementById('sidebar');

document.getElementById('buildStamp').textContent=new Date().toLocaleString();

function updateCount(){
document.getElementById('selectedCount').textContent=`${selected.size} Selected`;
}

function toggle(id){

if(selected.has(id)){
selected.delete(id);
}else{
selected.add(id);
}

renderSymptoms(SYMPTOMS,selected,toggle);
updateCount();

}

renderSymptoms(SYMPTOMS,selected,toggle);
updateCount();

document.getElementById('runBtn').addEventListener('click',()=>{

const filtered=SYMPTOMS.filter(s=>selected.has(s.id));

renderResults(filtered);

if(window.innerWidth<768){
sidebar.classList.remove('open');
}

});

document.getElementById('clearBtn').addEventListener('click',()=>{
selected.clear();
renderSymptoms(SYMPTOMS,selected,toggle);
updateCount();
});

fab.addEventListener('click',()=>{
sidebar.classList.toggle('open');
});
