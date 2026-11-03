export const $=(selector,root=document)=>root.querySelector(selector);
export const escapeText=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
export const formatNumber=value=>{const n=Math.max(0,Number(value)||0);if(n>=1e6)return (n/1e6).toFixed(n%1e6?1:0)+" jt";if(n>=1e3)return (n/1e3).toFixed(n%1e3?1:0)+" rb";return String(n)};
let toastTimer;
export function toast(message){const element=$("#toast");if(!element)return;element.textContent=message;element.classList.remove("hidden");clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.add("hidden"),2300)}
