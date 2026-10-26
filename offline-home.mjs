import { assetLibrary } from './harness/launcher-asset-manager.mjs';
const status = document.querySelector('#status');
const libraryStatus = document.querySelector('#library');
const prepare = document.querySelector('#prepare');
const check = document.querySelector('#check');
const play = document.querySelector('#play');
const progress = document.querySelector('#progress');
const reloadKey = 'zero-hour-isolation-reload:' + new URL('./', import.meta.url).pathname;
function reloadForIsolation() {
  if (sessionStorage.getItem(reloadKey)) throw new Error('Chrome did not enable isolation after the controlled reload. Check browser support or policy; no automatic retry will loop.');
  sessionStorage.setItem(reloadKey, '1');
  status.textContent = 'Engine verified. Reloading once to enable isolated WebAssembly threads…';
  location.reload();
}
if (!localStorage.getItem('cncPortDisplaySettings.v2')) localStorage.setItem('cncPortDisplaySettings.v2', JSON.stringify({mode:'fixed',width:1280,height:720}));
localStorage.setItem('cncPortShaderTier','ff');
function workerReport(worker) {
  return new Promise((resolve,reject)=>{
    const channel = new MessageChannel();
    const timer = setTimeout(()=>reject(new Error('Offline cache verification timed out')),45000);
    channel.port1.onmessage = event => { clearTimeout(timer);channel.port1.close();resolve(event.data); };
    worker.postMessage({kind:'verify-offline-cache'},[channel.port2]);
  });
}
async function readiness() {
  if (!isSecureContext || !('serviceWorker' in navigator)) throw new Error('This edition needs an HTTPS address and service workers enabled in Chrome. A file:// copy cannot prepare it.');
  const worker = navigator.serviceWorker.controller;
  if (!worker) { status.textContent = 'Engine is not prepared for offline use yet. Click Prepare offline engine while online.'; return; }
  if(worker.scriptURL !== new URL('./offline-worker.js',import.meta.url).href) throw new Error('Another worker controls this address. Use a dedicated project address.');
  const report = await workerReport(worker);
  if (!report.ok) throw new Error('Offline engine cache is incomplete: '+report.error);
  if (!crossOriginIsolated) { reloadForIsolation(); return; }
  if (typeof SharedArrayBuffer !== 'function') throw new Error('WebAssembly shared memory is unavailable in this browser.');
  sessionStorage.removeItem(reloadKey);
  const library = await assetLibrary.verifyInstalledLibrary();
  libraryStatus.textContent = library ? `Game library verified: ${library.archives.length} required archives stored locally.` : 'Your game library has not been installed at this address yet.';
  const persistent = await navigator.storage.persisted();
  play.hidden = false;
  status.textContent = `Engine cache verified: ${report.files} files, version ${report.version}.\nIsolation and WebAssembly shared memory are available.\n${persistent ? 'Persistent site storage is granted.' : 'Storage is best-effort: Chrome may reclaim it under storage pressure.'}\n${library ? 'Ready for an offline launch test. Keep the same Chrome profile and saved address.' : 'Next: open the launcher and install your local game files.'}`;
}
prepare.addEventListener('click',async()=>{
  prepare.disabled = true; progress.hidden = false;
  try {
    status.textContent='Downloading and checking a complete engine version…';
    const registration=await navigator.serviceWorker.register('./offline-worker.js',{scope:'./',updateViaCache:'none'});
    const candidate=registration.installing || registration.waiting;
    if(candidate) await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('Preparation timed out; existing offline version was preserved')),90000);
      function changed(){if(['installed','activated'].includes(candidate.state)){clearTimeout(timer);resolve();}else if(candidate.state==='redundant'){clearTimeout(timer);reject(new Error('Engine download or hash verification failed; existing version was preserved'));}}
      candidate.addEventListener('statechange',changed);changed();
    });
    if(registration.waiting && registration.active) {
      status.textContent='A verified update is ready. Close all tabs for this address, then reopen it to switch versions safely.';return;
    }
    await navigator.serviceWorker.ready;
    await navigator.storage.persist();
    if(!navigator.serviceWorker.controller || !crossOriginIsolated) {
      reloadForIsolation();return;
    }
    await readiness();
  } catch(error) { status.textContent='Preparation stopped: '+error.message; }
  finally{prepare.disabled=false;progress.hidden=true;}
});
check.addEventListener('click',()=>readiness().catch(error=>{status.textContent='Not ready: '+error.message;}));
readiness().catch(error=>{status.textContent='Not ready: '+error.message;});
