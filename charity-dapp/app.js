// Minimal ethers v6 frontend for CharityRegistry
// Paste deployed address in UI. ABI included below.
// Hardcoded contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // replace with your deployed address

let provider, signer, contract, currentAccount, contractOwner;
let lastReceipt = null;

const CHARITY_REGISTRY_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"name","type":"string"}],"name":"registerCharity","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"charityWallet","type":"address"}],"name":"verifyCharity","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"}],"name":"createCause","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"causeId","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"amountWei","type":"uint256"}],"name":"createMilestone","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"causeId","type":"uint256"},{"internalType":"string","name":"note","type":"string"}],"name":"donate","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"causeId","type":"uint256"},{"internalType":"uint256","name":"milestoneId","type":"uint256"}],"name":"approveMilestone","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"causeId","type":"uint256"},{"internalType":"uint256","name":"milestoneId","type":"uint256"}],"name":"releaseMilestone","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amountWei","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},

  // ✅ Missing view functions added here:
  {"inputs":[],"name":"getCharities","outputs":[{"components":[
    {"internalType":"address","name":"wallet","type":"address"},
    {"internalType":"string","name":"name","type":"string"},
    {"internalType":"bool","name":"verified","type":"bool"},
    {"internalType":"bool","name":"exists","type":"bool"}],
    "internalType":"struct CharityRegistry.Charity[]","name":"","type":"tuple[]"}],
    "stateMutability":"view","type":"function"},
  
  {"inputs":[],"name":"getCauses","outputs":[{"components":[
    {"internalType":"uint256","name":"id","type":"uint256"},
    {"internalType":"address","name":"charity","type":"address"},
    {"internalType":"string","name":"title","type":"string"},
    {"internalType":"string","name":"description","type":"string"},
    {"internalType":"uint256","name":"totalDonations","type":"uint256"},
    {"internalType":"uint256","name":"totalReleased","type":"uint256"},
    {"internalType":"bool","name":"exists","type":"bool"}],
    "internalType":"struct CharityRegistry.Cause[]","name":"","type":"tuple[]"}],
    "stateMutability":"view","type":"function"},

  {"inputs":[{"internalType":"address","name":"charityWallet","type":"address"}],
   "name":"getCausesByCharity","outputs":[{"components":[
    {"internalType":"uint256","name":"id","type":"uint256"},
    {"internalType":"address","name":"charity","type":"address"},
    {"internalType":"string","name":"title","type":"string"},
    {"internalType":"string","name":"description","type":"string"},
    {"internalType":"uint256","name":"totalDonations","type":"uint256"},
    {"internalType":"uint256","name":"totalReleased","type":"uint256"},
    {"internalType":"bool","name":"exists","type":"bool"}],
    "internalType":"struct CharityRegistry.Cause[]","name":"","type":"tuple[]"}],
    "stateMutability":"view","type":"function"},

  {"inputs":[{"internalType":"uint256","name":"causeId","type":"uint256"}],
   "name":"getMilestoneCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
   "stateMutability":"view","type":"function"},

  {"inputs":[{"internalType":"uint256","name":"causeId","type":"uint256"},{"internalType":"uint256","name":"milestoneId","type":"uint256"}],
   "name":"getMilestone","outputs":[
    {"internalType":"uint256","name":"id","type":"uint256"},
    {"internalType":"string","name":"description","type":"string"},
    {"internalType":"uint256","name":"amount","type":"uint256"},
    {"internalType":"bool","name":"approved","type":"bool"},
    {"internalType":"bool","name":"released","type":"bool"}],
   "stateMutability":"view","type":"function"},

  {"inputs":[{"internalType":"address","name":"wallet","type":"address"}],
   "name":"isCharity","outputs":[
    {"internalType":"bool","name":"exists","type":"bool"},
    {"internalType":"bool","name":"verified","type":"bool"},
    {"internalType":"string","name":"name","type":"string"}],
   "stateMutability":"view","type":"function"},

  // Events (keep as is)
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"charity","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"}],"name":"CharityRegistered","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"charity","type":"address"}],"name":"CharityVerified","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"causeId","type":"uint256"},{"indexed":true,"internalType":"address","name":"charity","type":"address"},{"indexed":false,"internalType":"string","name":"title","type":"string"}],"name":"CauseCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"causeId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"milestoneId","type":"uint256"},{"indexed":false,"internalType":"string","name":"description","type":"string"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"MilestoneCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"donor","type":"address"},{"indexed":true,"internalType":"uint256","name":"causeId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"string","name":"note","type":"string"}],"name":"DonationMade","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"causeId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"milestoneId","type":"uint256"}],"name":"MilestoneApproved","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"causeId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"milestoneId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"charity","type":"address"}],"name":"MilestoneReleased","type":"event"}
];


// small helpers
const $ = id => document.getElementById(id);
const log = msg => { const el = document.createElement('div'); el.textContent = msg; $("events").prepend(el); console.debug(msg); };
function showSection(role){
  $("donorSection").classList.toggle("hidden", role !== 'donor');
  $("charitySection").classList.toggle("hidden", role !== 'charity');
  $("ownerSection").classList.toggle("hidden", role !== 'owner');
}
function showModal(text){ $("txStatus").textContent = text; $("txModal").classList.remove("hidden"); }
function hideModal(){ $("txModal").classList.add("hidden"); }
function setOwnerControlsEnabled(enabled){
  $("ownerLoginMsg").textContent = enabled ? "Owner unlocked" : "";
}

// safe address check that works across ethers versions
function isValidAddress(addr){
  try {
    if(typeof ethers.isAddress === 'function') return ethers.isAddress(addr);
    if(ethers.utils && typeof ethers.utils.isAddress === 'function') return ethers.utils.isAddress(addr);
  } catch(e){}
  try { return /^0x[0-9a-fA-F]{40}$/.test(String(addr)); } catch(e){ return false; }
}

// safe access helpers for contract-returned structs (some UMD builds return both numeric + named fields)
function field(obj, name, idx){
  if(obj === undefined || obj === null) return undefined;
  if(name in obj) return obj[name];
  if(typeof obj[idx] !== 'undefined') return obj[idx];
  return undefined;
}

// Ensure MetaMask is available and create provider
async function ensureProvider(){
  if(!window.ethereum) throw new Error("MetaMask not installed");
  provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
}

async function connect(){
  try {
    await ensureProvider();
    await provider.send('eth_requestAccounts', []);
    signer = await provider.getSigner();
    currentAccount = await signer.getAddress();
    $("account").textContent = `Connected: ${currentAccount}`;
    // instantiate contract now that signer exists
    attachContract();
    // ✅ immediately refresh list
    setTimeout(refreshCharityList, 300);
    // if user is a charity, refresh their dashboard shortly after attach
    setTimeout(()=> renderCharityDashboard(), 600);
    return true;
  } catch (err) {
    alert("Connect failed: " + (err && err.message ? err.message : err));
    console.error(err);
    return false;
  }
}

function attachContract(){
  try {
    if(!CONTRACT_ADDRESS || !isValidAddress(CONTRACT_ADDRESS)){
      $("account").textContent = `Invalid CONTRACT_ADDRESS in app.js`;
      console.error("Invalid CONTRACT_ADDRESS", CONTRACT_ADDRESS);
      return;
    }
    contract = new ethers.Contract(CONTRACT_ADDRESS, CHARITY_REGISTRY_ABI, signer);
    // fetch owner
    contract.owner().then(owner => {
      contractOwner = owner;
      log(`Contract attached. Owner: ${owner}`);
      bindEvents();
      // refresh lists
      setTimeout(refreshCharityList, 200);
    }).catch(err => {
      console.error("owner() read error", err);
      $("account").textContent = `Error reading owner()`;
    });
  } catch (e) {
    console.error("Attach contract error", e);
    $("account").textContent = `Attach error`;
  }
}

function bindEvents(){
  if(!contract) return;
  try { contract.removeAllListeners(); } catch(e){}
  contract.on("CharityRegistered", (charity, name) => { 
    log(`CharityRegistered: ${charity} - ${name}`); 
    refreshCharityList(); 
  });
  contract.on("CharityVerified", (charity) => { 
    log(`CharityVerified: ${charity}`); 
    refreshCharityList(); 
  });
  contract.on("CauseCreated", (causeId, charity, title) => { 
    log(`CauseCreated: cause ${causeId} for ${charity} - ${title}`); 
    refreshCharityList(); 
  });
  contract.on("MilestoneCreated", (cId, msId, desc, amount) => { 
    log(`MilestoneCreated: cause ${cId} ms ${msId} amount ${ethers.formatEther(amount)} ETH - ${desc}`); 
    refreshCharityList(); 
  });
  contract.on("DonationMade", (donor, causeId, amount, note) => { 
    log(`DonationMade: ${donor} -> cause ${causeId} ${ethers.formatEther(amount)} ETH note=${note}`); 
    refreshCharityList(); 
  });
  contract.on("MilestoneApproved", (cId, msId) => { 
    log(`MilestoneApproved: cause ${cId} ms ${msId}`); 
    refreshCharityList(); 
  });
  contract.on("MilestoneReleased", (cId, msId, amount, charity) => { 
    log(`MilestoneReleased: cause ${cId} ms ${msId} amount ${ethers.formatEther(amount)} ETH to ${charity}`); 
    refreshCharityList(); 
  });
}

async function refreshCharityList(){
  if(!contract){
    console.warn("refreshCharityList: contract not attached");
    return;
  }
  try {
    const charities = await contract.getCharities();
    const causes = await contract.getCauses();
    console.debug("Fetched charities", charities);
    console.debug("Fetched causes", causes);
    renderDonorList(charities, causes);
    await renderOwnerLists(charities, causes);
    renderCharitiesSideList(charities, causes); // legacy common list
  } catch(e){ 
    console.error("refresh list failed", e); 
    log("refreshCharityList failed: " + (e && e.message ? e.message : e));
  }
}

function renderCharitiesSideList(charities, causes){
  const list = $("charityList");
  if(!list) return;
  list.innerHTML = "";
  for(const c of charities){
    const wallet = field(c, 'wallet', 0) || "(no-wallet)";
    const name = field(c, 'name', 1) || "(no-name)";
    const verified = Boolean(field(c, 'verified', 2));
    const div = document.createElement("div");
    div.className="charity";
    div.innerHTML = `<b>${name}</b> (${wallet}) ${verified?"✅":"❌"}`;
    const cList = document.createElement("ul");
    causes.filter(cs => (field(cs,'charity',1)||'').toLowerCase()===String(wallet).toLowerCase())
      .forEach(cs=>{
        const li=document.createElement("li");
        const csid = field(cs,'id',0);
        li.innerHTML=`Cause #${csid}: ${field(cs,'title',2)} (${ethers.formatEther(field(cs,'totalDonations',4)||0n)} ETH donated) 
          <button onclick="donateTo(${csid})">Donate</button>`;
        cList.appendChild(li);
      });
    div.appendChild(cList);
    list.appendChild(div);
  }
}

// -------------------- Donor view rendering --------------------
function renderDonorList(charities, causes){
  const container = $("donorBrowse");
  if(!container) return;
  container.innerHTML = "";

  // list only verified charities with their causes
  for(const c of charities){
    const wallet = field(c,'wallet',0);
    const name = field(c,'name',1);
    const verified = Boolean(field(c,'verified',2));
    if(!verified) continue;
    const card = document.createElement("div");
    card.className = "charity";
    card.innerHTML = `<strong>${name}</strong> (${wallet})`;
    const ul = document.createElement("ul");

    const charityCauses = causes.filter(cs => (field(cs,'charity',1)||'').toLowerCase() === String(wallet).toLowerCase());
    if(charityCauses.length === 0){
      const li = document.createElement("li");
      li.textContent = "No causes yet";
      ul.appendChild(li);
    } else {
      for(const cs of charityCauses){
        const csid = field(cs,'id',0);
        const cstitle = field(cs,'title',2) || '';
        const csdesc = field(cs,'description',3) || '';
        const totalDon = field(cs,'totalDonations',4) || 0n;
        const li = document.createElement("li");
        li.innerHTML = `<div style="display:flex;gap:8px;align-items:center;">
            <div style="flex:1;">
              <div><strong>${cstitle}</strong> (Cause #${csid})</div>
              <div style="font-size:12px;color:#9ca3af">${csdesc}</div>
              <div style="font-size:12px">Total donated: ${ethers.formatEther(totalDon)} ETH</div>
            </div>
            <div style="min-width:140px">
              <button onclick="prefillDonate(${csid}, '${escapeHtml(cstitle)}', '${wallet}')">Donate</button>
            </div>
          </div>`;
        ul.appendChild(li);
      }
    }
    card.appendChild(ul);
    container.appendChild(card);
  }
}

// Called when donor clicks Donate on a specific cause; pre-fills donation form
window.prefillDonate = function(causeId, causeTitle, charityWallet){
  $("donateCauseId").value = causeId;
  $("donateToText").textContent = `Donating to: ${unescapeHtml(causeTitle)} (Cause #${causeId})`;
  showSection("donor");
};

// -------------------- Charity dashboard rendering --------------------
async function renderCharityDashboard(){
  if(!contract){
    console.warn("renderCharityDashboard: contract not ready");
    return;
  }
  try {
    if(!currentAccount){
      try { currentAccount = await (await provider.getSigner()).getAddress(); } catch(e){ currentAccount = null; }
    }
    if(!currentAccount) return;
    const isChar = await contract.isCharity(currentAccount);
    const exists = Boolean(isChar[0]);
    const verified = Boolean(isChar[1]);
    const name = String(isChar[2] || "");

    $("myCharityName").textContent = exists ? `${name} (${currentAccount})` : "Not registered";

    const listEl = $("myCauses");
    listEl.innerHTML = "";

    if(!exists){
      listEl.innerHTML = "<div class='charity'>You are not a registered charity. Use the register form above.</div>";
      $("charityWithdrawable").textContent = "0 ETH";
      return;
    }

    // get causes by charity
    const causes = await contract.getCausesByCharity(currentAccount);
    if(!causes || causes.length === 0){
      listEl.innerHTML = "<div class='charity'>No causes yet.</div>";
    } else {
      for(const cs of causes){
        const csid = field(cs,'id',0);
        const cstitle = field(cs,'title',2) || '';
        const csdesc = field(cs,'description',3) || '';
        const totalDon = field(cs,'totalDonations',4) || 0n;

        const csCard = document.createElement("div");
        csCard.className = "charity";
        csCard.innerHTML = `<div><strong>${cstitle}</strong> (Cause #${csid})</div>
          <div style="font-size:13px;color:#9ca3af">${csdesc}</div>
          <div style="font-size:12px">Total donated: ${ethers.formatEther(totalDon)} ETH</div>
          <div id="cause-${csid}-milestones"></div>`;
        listEl.appendChild(csCard);

        // render milestones for this cause
        const msCount = await contract.getMilestoneCount(csid);
        const msContainer = csCard.querySelector(`#cause-${csid}-milestones`);
        if(msCount === 0){
          msContainer.innerHTML = `<div style="margin-top:6px">No milestones yet.</div>`;
        } else {
          const u = document.createElement("ul");
          for(let i=0;i<msCount;i++){
            const m = await contract.getMilestone(csid, i);
            const mId = m[0], mDesc = m[1], mAmt = m[2], mApp = m[3], mRel = m[4];
            const li = document.createElement("li");
            li.innerHTML = `<div><strong>Milestone #${mId}</strong> - ${mDesc}</div>
              <div style="font-size:12px">Target: ${ethers.formatEther(mAmt)} ETH — Approved: ${mApp ? "✅" : "❌"} — Released: ${mRel ? "✅" : "❌"}</div>`;
            u.appendChild(li);
          }
          msContainer.appendChild(u);
        }
      }
    }

    try {
  // we already fetched `causes` for this charity above: reuse it if available, otherwise query
  const charityCauses = await contract.getCausesByCharity(currentAccount);
  let totalReleased = 0n;
  for (const cs of charityCauses) {
    // `field` helper handles returned struct shapes
    const released = BigInt(field(cs, 'totalReleased', 5) || 0n);
    totalReleased += released;
  }
  $("charityWithdrawable").textContent = `${ethers.formatEther(totalReleased)} ETH`;
} catch (e) {
  $("charityWithdrawable").textContent = "0 ETH";
}


  } catch(e){
    console.error("renderCharityDashboard error", e);
    log("renderCharityDashboard error: " + (e && e.message ? e.message : e));
  }
}

// -------------------- Owner lists rendering --------------------
async function renderOwnerLists(charities, causes){
  const unverifiedEl = $("ownerUnverified");
  const verifiedEl = $("ownerVerified");
  if(!unverifiedEl || !verifiedEl) return;
  unverifiedEl.innerHTML = "";
  verifiedEl.innerHTML = "";

  // iterate using for..of so we can await inside and render correctly
  for(const c of charities){
    const wallet = field(c,'wallet',0);
    const name = field(c,'name',1) || "(no-name)";
    const verified = Boolean(field(c,'verified',2));
    const card = document.createElement("div");
    card.className = "charity";
    card.innerHTML = `<div><strong>${name}</strong> — ${wallet}</div>`;

    if(!verified){
      const btn = document.createElement("button");
      btn.textContent = "Verify";
      btn.onclick = async () => {
        if(!contract) return alert('Connect first');
        try {
          await withTx(contract.verifyCharity(wallet));
        } catch(err){ 
          console.error(err);
          showModal("Verify failed: " + (err && err.message ? err.message : err));
        }
      };
      card.appendChild(btn);
      unverifiedEl.appendChild(card);
    } else {
      // Verified charity: show causes + per-cause milestones with owner approve/release controls
      const causesForC = causes.filter(cs => (field(cs,'charity',1)||'').toLowerCase() === String(wallet).toLowerCase());
      if(causesForC.length === 0){
        const d = document.createElement("div");
        d.textContent = "No causes";
        card.appendChild(d);
      } else {
        const ul = document.createElement("ul");
        for(const cs of causesForC){
          const csid = field(cs,'id',0);
          const li = document.createElement("li");
          li.innerHTML = `<div><strong>${field(cs,'title',2)}</strong> (Cause #${csid}) - Total donated: ${ethers.formatEther(field(cs,'totalDonations',4)||0n)} ETH</div>
                          <div id="owner-cause-${csid}-ms"></div>`;
          ul.appendChild(li);

          // populate milestones for owner
          const msCount = await contract.getMilestoneCount(csid);
          const msContainer = li.querySelector(`#owner-cause-${csid}-ms`);
          if(msCount === 0){
            msContainer.innerHTML = "<div style='font-size:12px'>No milestones</div>";
          } else {
            const innerUl = document.createElement("ul");
            for(let i=0;i<msCount;i++){
              const m = await contract.getMilestone(csid, i);
              const mId = m[0], mDesc = m[1], mAmt = m[2], mApp = m[3], mRel = m[4];
              const li2 = document.createElement("li");
              const approveDisabled = mApp ? 'disabled' : '';
              const releaseDisabled = (!mApp || mRel) ? 'disabled' : '';
              li2.innerHTML = `<div>
                  <div><strong>Milestone #${mId}</strong> - ${mDesc}</div>
                  <div style="font-size:12px">Target: ${ethers.formatEther(mAmt)} ETH — Approved: ${mApp ? "✅" : "❌"} — Released: ${mRel ? "✅" : "❌"}</div>
                  <div style="display:flex;gap:8px;margin-top:6px">
                    <button ${approveDisabled} onclick="ownerApproveMilestone(${csid}, ${mId})">Approve</button>
                    <button ${releaseDisabled} onclick="ownerReleaseMilestone(${csid}, ${mId})">Release</button>
                  </div>
                </div>`;
              innerUl.appendChild(li2);
            }
            msContainer.appendChild(innerUl);
          }
        }
        card.appendChild(ul);
      }
      verifiedEl.appendChild(card);
    }
  }
}

// Owner approve/release helpers used in the rendered buttons
window.ownerApproveMilestone = async function(causeId, msId){
  if(!contract) return alert('Connect first');
  try {
    await withTx(contract.approveMilestone(BigInt(causeId), BigInt(msId)));
  } catch(e){ console.error(e); showModal("Approve failed: " + (e && e.message ? e.message : e)); }
};
window.ownerReleaseMilestone = async function(causeId, msId){
  if(!contract) return alert('Connect first');
  try {
    await withTx(contract.releaseMilestone(BigInt(causeId), BigInt(msId)));
    // small delay and refresh cause/charity dashboard
    setTimeout(() => { refreshCharityList(); renderCharityDashboard(); }, 600);
  } catch(e){
    console.error(e);
    showModal("Release failed: " + (e && e.message ? e.message : e));
  }
};



// small HTML helpers to escape/unescape
function escapeHtml(str){
  return String(str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
function unescapeHtml(str){
  return String(str || '').replace(/&quot;/g, '"').replace(/\\'/g, "'");
}

// -------------------- Donate flow --------------------
window.donateTo = function(causeId){
  prefillDonate(causeId, `Cause ${causeId}`, '');
};

async function ownerLogin(){
  const email = $("adminEmail").value.trim();
  const pass = $("adminPass").value.trim();
  if(email !== 'admin@gmail.com' || pass !== 'admin'){
    $("ownerLoginMsg").textContent = 'Bad credentials';
    setOwnerControlsEnabled(false);
    return;
  }
  if(!contract){ $("ownerLoginMsg").textContent = 'Not connected to contract'; return; }
  try {
    const addr = await signer.getAddress();
    if(addr.toLowerCase() !== contractOwner.toLowerCase()){
      $("ownerLoginMsg").textContent = 'Connected wallet is not contract owner()';
      setOwnerControlsEnabled(false);
      return;
    }
    $("ownerLoginMsg").textContent = 'Owner unlocked';
    setOwnerControlsEnabled(true);
    // refresh owner lists
    await refreshCharityList();
  } catch (err){
    $("ownerLoginMsg").textContent = 'Error: ' + (err && err.message ? err.message : err);
  }
}

async function withTx(promise){
  try {
    const tx = await promise;
    showModal(`Pending: ${tx.hash}`);
    const rec = await tx.wait();
    showModal(`Confirmed in block ${rec.blockNumber}\nTx: ${tx.hash}`);
    // small delay so UI refresh sees chain state
    setTimeout(() => { refreshCharityList(); renderCharityDashboard(); }, 500);
    return rec;
  } catch (err) {
    const reason = (err && err.shortMessage) || (err && err.message) || 'Transaction failed';
    showModal(`Failed: ${reason}`);
    throw err;
  }
}

// DOM bindings and role toggling
window.addEventListener('DOMContentLoaded', () => {
  // initial UI
  showSection($("role").value);

  $("connectBtn").onclick = async () => {
    const ok = await connect();
    if(ok){
      showSection($("role").value);
    }
  };

  // role change toggles sections
  $("role").onchange = (e) => {
    showSection(e.target.value);
    if(e.target.value === 'charity') renderCharityDashboard();
    // owner view refresh when selected
    if(e.target.value === 'owner') refreshCharityList();
  };

  // Donor actions
  $("donateBtn").onclick = async () => {
    if(!contract) return alert('Connect to MetaMask first');
    const causeIdStr = $("donateCauseId").value.trim();
    const amountEth = $("donateAmount").value.trim();
    if(!causeIdStr || !amountEth) return alert('Select a cause and enter amount');
    const causeId = BigInt(causeIdStr);
    const value = ethers.parseEther(amountEth);
    const note = $("donateNote").value.trim();
    try {
      const tx = await contract.donate(causeId, note, { value });
      showModal(`Pending: ${tx.hash}`);
      const rec = await tx.wait();
      showModal(`Confirmed in block ${rec.blockNumber}\nTx: ${tx.hash}`);
      try { currentAccount = currentAccount || (await signer.getAddress()); } catch(e){}
      lastReceipt = { donor: currentAccount, causeId: causeId.toString(), amountEth, txHash: tx.hash, note };
      refreshCharityList();
      renderCharityDashboard();
    } catch (err) {
      const reason = (err && err.shortMessage) || (err && err.message) || 'Donate failed';
      showModal(`Failed: ${reason}`);
      throw err;
    }
  };

  $("downloadReceipt").onclick = () => {
    if(!lastReceipt) return alert('No receipt available');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('Donation Receipt', 20, 20);
    doc.text(`Donor: ${lastReceipt.donor}`, 20, 30);
    doc.text(`Cause ID: ${lastReceipt.causeId}`, 20, 40);
    doc.text(`Amount: ${lastReceipt.amountEth} ETH`, 20, 50);
    doc.text(`Tx Hash: ${lastReceipt.txHash}`, 20, 60);
    if(lastReceipt.note) doc.text(`Note: ${lastReceipt.note}`, 20, 70);
    doc.save('donation_receipt.pdf');
  };

  // Charity actions
  $("registerCharity").onclick = async () => {
    if(!contract) return alert('Connect first');
    const name = $("charityName").value.trim();
    if(!name) return alert('Enter charity name');
    await withTx(contract.registerCharity(name));
    setTimeout(() => { renderCharityDashboard(); refreshCharityList(); }, 3000);
  };

  $("createCause").onclick = async () => {
    if(!contract) return alert('Connect first');
    const title = $("causeTitle").value.trim();
    const desc = $("causeDesc").value.trim();
    if(!title) return alert('Enter title');
    await withTx(contract.createCause(title, desc));
    setTimeout(() => { renderCharityDashboard(); refreshCharityList(); }, 3000);
  };

  $("createMilestone").onclick = async () => {
    if(!contract) return alert('Connect first');
    const causeIdStr = $("msCauseId").value.trim();
    const desc = $("msDesc").value.trim();
    const amountEth = $("msAmount").value.trim();
    if(!causeIdStr || !desc || !amountEth) return alert('Enter cause id, desc, amount');
    const causeId = BigInt(causeIdStr);
    const amountWei = ethers.parseEther(amountEth);
    await withTx(contract.createMilestone(causeId, desc, amountWei));
    setTimeout(() => { renderCharityDashboard(); refreshCharityList(); }, 3000);
  };

  $("withdrawBtn").onclick = async () => {
  if(!contract) return alert('Connect first');
  const amountEth = $("withdrawAmount").value.trim();
  if(!amountEth) return alert('Enter amount');
  const amountWei = ethers.parseEther(amountEth);
  await withTx(contract.withdraw(amountWei));
  // Refresh balances and causes
  await renderCharityDashboard();
  await refreshCharityList();
};


  // Owner actions
  $("ownerLoginBtn").onclick = ownerLogin;

  $("logoutBtn").onclick = () => {
    currentAccount = null;
    signer = null;
    contract = null;
    $("account").textContent = "Not connected";
    setOwnerControlsEnabled(false);
    log("Logged out");
  };

  $("closeModal").onclick = hideModal;

  // handle account / chain changes
  if(window.ethereum){
    window.ethereum.on('accountsChanged', async (accounts) => {
      try {
        if(accounts && accounts.length > 0){
          await ensureProvider();
          signer = await provider.getSigner();
          currentAccount = await signer.getAddress();
          $("account").textContent = `Connected: ${currentAccount}`;
          attachContract(); // re-attach signer and contract
          setTimeout(() => { refreshCharityList(); renderCharityDashboard(); }, 300);
        } else {
          currentAccount = null;
          $("account").textContent = 'Not connected';
        }
      } catch(e){ console.error(e); }
      setOwnerControlsEnabled(false);
    });
    window.ethereum.on('chainChanged', () => { window.location.reload(); });
  }

  
});

// ==========================
// Modal close button handler
// ==========================
document.getElementById("closeModal").addEventListener("click", () => {
  const modal = document.getElementById("txModal");
  modal.classList.add("hidden"); // hide modal
});

function showTxModal(message) {
  const modal = document.getElementById("txModal");
  const status = document.getElementById("txStatus");
  status.innerText = message;
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.add("hidden"), 3000); // auto close
}

