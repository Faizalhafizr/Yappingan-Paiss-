import {createInitialState} from "./state.js";
import {$,toast} from "./dom.js";
import {renderPreview} from "./render.js";
import {downloadPNG,sharePNG} from "./export.js";
const state=createInitialState();
const TEMPLATE_KEY="social-mockup-studio-threads-templates-v1";
function readTemplates(){try{const value=JSON.parse(localStorage.getItem(TEMPLATE_KEY)||"[]");return Array.isArray(value)?value:[]}catch{return []}}
function writeTemplates(templates){localStorage.setItem(TEMPLATE_KEY,JSON.stringify(templates))}
function renderTemplateOptions(selected=""){
 const select=$("#savedTemplates");const templates=readTemplates();
 select.innerHTML='<option value="">Pilih template…</option>'+templates.map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("");
 if(selected)select.value=selected;
 $("#deleteTemplate").disabled=!select.value;$("#applyTemplate").disabled=!select.value;
}
function templateSnapshot(){return {profile:JSON.parse(JSON.stringify(state.profile)),time:state.time,stats:JSON.parse(JSON.stringify(state.stats)),statMode:state.statMode,theme:state.theme,fontSize:state.fontSize,scale:state.scale,ratio:state.ratio,showLabel:state.showLabel}}
function applySavedTemplate(template){
 state.profile=JSON.parse(JSON.stringify(template.profile));state.time=template.time||"08/19";state.stats={...state.stats,...template.stats};
 for(const key of ["statMode","theme","fontSize","scale","ratio","showLabel"])if(template[key]!==undefined)state[key]=template[key];
 state.text="";state.replies=[];state.note="";syncInputs();toast(`Template “${template.name}” kepake. Gas tulis post baru, lu!`);
}

const statFields=["replies","reposts","quotes","likes","views","shares","bookmarks"];
const home=$("#homeScreen"),editor=$("#editorScreen");
function showEditor(){state.platform="threads";home.classList.add("hidden");editor.classList.remove("hidden");$("#backHome").classList.remove("hidden");$("#openPreview").classList.remove("hidden");syncInputs();window.scrollTo({top:0,behavior:"smooth"})}
function showHome(){editor.classList.add("hidden");home.classList.remove("hidden");$("#backHome").classList.add("hidden");$("#openPreview").classList.add("hidden");window.scrollTo({top:0,behavior:"smooth"})}
function esc(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function defaultReply(){return {text:"",time:"sekarang",profile:{name:"Nama Balasan",avatar:"",avatarY:50},showStats:false,stats:{likes:0,replies:0,reposts:0,shares:0}}}
function renderReplyEditors(){const box=$("#replyEditors");box.innerHTML=state.replies.map((raw,index)=>{const r=typeof raw==="string"?{...defaultReply(),text:raw}:raw;r.profile ||= {name:"Nama Balasan",avatar:"",avatarY:50};r.stats ||= {likes:0,replies:0,reposts:0,shares:0};state.replies[index]=r;return `<div class="reply-editor"><div class="reply-editor-head"><span>Balasan ${index+1}</span><button type="button" data-remove="${index}">Hapus</button></div><label>Nama tampilan<input data-rname="${index}" value="${esc(r.profile.name||"Nama Balasan")}"></label><label>Waktu balasan<input data-rtime="${index}" value="${esc(r.time||"sekarang")}"></label><label>Teks balasan<textarea data-reply="${index}" rows="2" placeholder="Tulis balasan…">${esc(r.text)}</textarea></label><label class="upload-label">Foto profil balasan<input type="file" accept="image/*" data-ravatar="${index}"></label><label class="check-row"><input type="checkbox" data-rstats="${index}" ${r.showStats?"checked":""}> Tampilkan statistik balasan</label><div class="reply-stat-fields ${r.showStats?"":"hidden"}">${["likes","replies","reposts","shares"].map(key=>`<label>${({likes:"Suka",replies:"Balasan",reposts:"Repost",shares:"Bagikan"})[key]}<input type="number" min="0" data-rstat="${index}:${key}" value="${Number(r.stats[key])||0}"></label>`).join("")}</div></div>`}).join("")}
function syncInputs(){const put=(id,value)=>{const el=$("#"+id);if(el)el.value=value};put("mainText",state.text);put("postTime",state.time);put("postNote",state.note);put("displayName",state.profile.name);put("username",state.profile.username);put("bio",state.profile.bio);$("#verified").checked=!!state.profile.verified;$("#avatarY").value=state.profile.avatarY??50;for(const key of statFields)put(key,state.stats[key]??0);put("statMode",state.statMode);put("theme",state.theme);put("fontSize",state.fontSize);put("scale",state.scale);put("ratio",state.ratio||"auto");$("#showLabel").checked=!!state.showLabel;renderReplyEditors();renderPreview(state)}
function readInputs(){state.text=$("#mainText").value;state.time=$("#postTime").value;state.note=$("#postNote").value;state.profile.name=$("#displayName").value||"Nama Contoh";state.profile.username=$("#username").value;state.profile.bio=$("#bio").value;state.profile.verified=$("#verified").checked;state.profile.avatarY=Number($("#avatarY").value||50);for(const key of statFields)state.stats[key]=Math.max(0,Number($("#"+key).value)||0);state.statMode=$("#statMode").value;state.theme=$("#theme").value;state.fontSize=$("#fontSize").value;state.scale=$("#scale").value;state.ratio=$("#ratio").value;state.showLabel=$("#showLabel").checked;renderPreview(state)}
document.querySelectorAll("[data-platform]").forEach(button=>button.addEventListener("click",showEditor));$("#backHome").addEventListener("click",showHome);$("#backToPlatforms").addEventListener("click",showHome);$("#switchPlatform").addEventListener("click",showHome);
document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(item=>item.classList.toggle("active",item===tab));document.querySelectorAll("[data-panel]").forEach(panel=>panel.classList.toggle("hidden",panel.dataset.panel!==tab.dataset.tab))}));$("#openPreview").addEventListener("click",()=>$("#previewColumn").scrollIntoView({behavior:"smooth",block:"start"}));
$("#addReply").addEventListener("click",()=>{state.replies.push(defaultReply());renderReplyEditors();renderPreview(state)});
$("#replyEditors").addEventListener("input",event=>{const el=event.target;let match;if((match=el.dataset.reply)!==undefined)state.replies[Number(match)].text=el.value;else if((match=el.dataset.rname)!==undefined)state.replies[Number(match)].profile.name=el.value;else if((match=el.dataset.rtime)!==undefined)state.replies[Number(match)].time=el.value;else if((match=el.dataset.rstat)!==undefined){const [i,key]=match.split(":");state.replies[Number(i)].stats[key]=Math.max(0,Number(el.value)||0)}renderPreview(state)});
$("#replyEditors").addEventListener("change",event=>{const el=event.target;if(el.dataset.rstats!==undefined){const i=Number(el.dataset.rstats);state.replies[i].showStats=el.checked;renderReplyEditors();renderPreview(state)}else if(el.dataset.ravatar!==undefined){const file=el.files?.[0];if(!file)return;const i=Number(el.dataset.ravatar);const reader=new FileReader();reader.onload=()=>{state.replies[i].profile.avatar=String(reader.result);renderPreview(state)};reader.readAsDataURL(file)}});
$("#replyEditors").addEventListener("click",event=>{const button=event.target.closest("[data-remove]");if(button){state.replies.splice(Number(button.dataset.remove),1);renderReplyEditors();renderPreview(state)}});
$(".controls").addEventListener("input",event=>{if(!["avatarFile","loadProject"].includes(event.target.id)&&!event.target.matches("[data-reply],[data-rname],[data-rtime],[data-rstat]"))readInputs()});
$(".controls").addEventListener("change",event=>{if(event.target.id==="avatarFile"){const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{state.profile.avatar=String(reader.result);renderPreview(state)};reader.readAsDataURL(file)}else readInputs()});
$("#statPreset").addEventListener("change",event=>{const presets={quiet:{likes:12,replies:2,reposts:1,shares:0},normal:{likes:1000,replies:36,reposts:122,shares:141},viral:{likes:12500,replies:640,reposts:2400,shares:1800},zero:{likes:0,replies:0,reposts:0,shares:0}};const preset=presets[event.target.value];if(preset){Object.assign(state.stats,preset);syncInputs()}});
$("#downloadPng").addEventListener("click",()=>{readInputs();downloadPNG(state.scale)});
$("#sharePng").addEventListener("click",()=>{readInputs();sharePNG(state.scale)});
$("#saveProject").addEventListener("click",()=>{readInputs();const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));link.download="threads-mockup-project.json";link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);toast("Proyek disimpan")});
$("#loadProject").addEventListener("change",event=>{const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!data.profile||!Array.isArray(data.replies)||!data.stats)throw new Error("Invalid project");Object.assign(state,data);state.platform="threads";syncInputs();toast("Proyek dimuat")}catch{toast("File proyek tidak valid")}event.target.value=""};reader.readAsText(file)});

renderTemplateOptions();
$("#savedTemplates").addEventListener("change",()=>{ $("#deleteTemplate").disabled=!$("#savedTemplates").value;$("#applyTemplate").disabled=!$("#savedTemplates").value; });
$("#saveTemplate").addEventListener("click",()=>{
 readInputs();const name=$("#templateName").value.trim();if(!name){toast("Nama templatenya isi dulu, bro.");$("#templateName").focus();return;}
 try{const templates=readTemplates();const id=`tpl-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;templates.push({id,name,savedAt:new Date().toISOString(),...templateSnapshot()});writeTemplates(templates);renderTemplateOptions(id);$("#templateName").value="";toast("Aman, template lu udah kesimpen di HP ini!");}
 catch{toast("Penyimpanan penuh. Coba foto profil yang lebih kecil.");}
});
$("#applyTemplate").addEventListener("click",()=>{const id=$("#savedTemplates").value;if(!id)return;const template=readTemplates().find(t=>t.id===id);if(template)applySavedTemplate(template);});
$("#deleteTemplate").addEventListener("click",()=>{const id=$("#savedTemplates").value;if(!id)return;const templates=readTemplates();const target=templates.find(t=>t.id===id);if(!target)return;if(!confirm(`Hapus template “${target.name}” dari browser ini?`))return;writeTemplates(templates.filter(t=>t.id!==id));renderTemplateOptions();toast("Template udah dihapus, bro.");});

syncInputs();
