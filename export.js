import {$,toast} from "./dom.js";

async function createPNG(scale){
  if(typeof window.html2canvas!=="function") throw new Error("Pustaka ekspor belum tersedia. Periksa koneksi internet.");
  const element=$("#capture");
  if(!element) throw new Error("Area pratinjau tidak ditemukan.");
  const canvas=await window.html2canvas(element,{backgroundColor:null,scale:Number(scale)||2,useCORS:true,logging:false});
  return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("PNG gagal dibuat")),"image/png"));
}
function saveBlob(blob){const link=document.createElement("a");const url=URL.createObjectURL(blob);link.href=url;link.download=`threads-mockup-${new Date().toISOString().slice(0,10)}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
export async function downloadPNG(scale){try{const blob=await createPNG(scale);saveBlob(blob);toast("PNG berhasil diunduh")}catch(error){console.error(error);toast(error.message||"Ekspor gagal. Coba lagi.")}}
export async function sharePNG(scale){try{const blob=await createPNG(scale);const file=new File([blob],`threads-mockup-${new Date().toISOString().slice(0,10)}.png`,{type:"image/png"});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:"Mockup Threads",text:"Mockup post Threads"});toast("Menu bagikan dibuka");return;}saveBlob(blob);toast("Berbagi file tidak didukung browser ini. PNG diunduh; kamu bisa membagikannya dari Galeri.")}catch(error){if(error?.name==="AbortError")return;console.error(error);toast(error.message||"Tidak bisa membagikan PNG")}}
