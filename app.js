const form=document.querySelector("#form"), btn=document.querySelector("#btn"), loading=document.querySelector("#loading"), result=document.querySelector("#result");
form.addEventListener("submit", async e=>{
 e.preventDefault(); btn.disabled=true; loading.classList.remove("hidden"); result.classList.add("hidden");
 const data=Object.fromEntries(new FormData(form).entries());
 try{
  const r=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
  const j=await r.json();
  if(!r.ok) throw new Error(j.error||"خطأ");
  result.textContent=j.result; result.classList.remove("hidden");
 }catch(err){result.textContent="❌ "+err.message; result.classList.remove("hidden")}
 finally{btn.disabled=false;loading.classList.add("hidden")}
});