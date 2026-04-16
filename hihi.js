// ==========================================================
// RANKERCLUT PREMIUM ENGINE (GOD MODE)
// Vercel Proxy + Strict cURL Headers Injector
// ==========================================================

// 🚨 BACK TO VERCEL PROXY (Because GitHub cannot run PHP)
const SP_PROXY = 'https://sp-api-theta.vercel.app/api/v1/proxy'; 
const FALLBACK_IMG = "https://i.ibb.co/dJbZq97B/2671188-1-logo.jpg";

const API = {
    OVERVIEW: 'https://course.nexttoppers.com/course/course-details',
    LIVE: 'https://course.nexttoppers.com/live/get-live-feed',
    CONTENT: 'https://course.nexttoppers.com/course/all-content',
    MEDIA: 'https://course.nexttoppers.com/course/content-details'
};

// 🚨 STRICT HEADERS (Exactly from your working cURL)
const NT_HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'app_id': '1770981347',
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozODQ4ODQzLCJhcHBfaWQiOiIxNzcwOTgxMzQ3IiwiZGV2aWNlX2lkIjoiZWQxNzc5MTktNzExZC00NGNmLTg1ZmMtZjk1MDE3NDg4ZTVmIiwicGxhdGZvcm0iOiIzIiwiaWF0IjoxNzc2MjQyOTIwLCJleHAiOjE3Nzg4MzQ5MjB9.EWK6tdSEictmYmmW2RBji5OgKMXUechHAG1Kzah0meo',
    'content-type': 'application/json',
    'origin': 'https://nexttoppers.com',
    'platform': '3',
    'referer': 'https://nexttoppers.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'user_id': '682065'
};

let currentCourseId = null;
let folderHistory = [];
window.masterBatches = [];

let MASTER_ID_LIST = [];
for(let i = 179; i >= 175; i--) MASTER_ID_LIST.push(i);
for(let i = 124; i >= 122; i--) MASTER_ID_LIST.push(i);
for(let i = 112; i >= 100; i--) MASTER_ID_LIST.push(i);
for(let i = 99; i >= 50; i--) MASTER_ID_LIST.push(i);

let currentIndex = 0;
const SCAN_CHUNK_SIZE = 15; 
let isScanning = false;

// ==========================================
// 🛡️ OMNI-FETCHER (SMART PROXY ROUTER)
// ==========================================
async function engineFetch(targetUrl, preferredMethod, payload = null) {
    async function hitProxy(methodToTry) {
        try {
            const response = await fetch(SP_PROXY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    target_url: targetUrl, 
                    method: methodToTry, 
                    payload: payload,
                    headers: NT_HEADERS // 🚨 Sending spoofed headers to Vercel
                })
            });
            
            // Text parse first to catch Vercel HTML errors safely
            const text = await response.text(); 
            try {
                return JSON.parse(text);
            } catch(e) {
                console.error("Proxy returned non-JSON. Vercel might be blocking it:", text);
                return null;
            }
        } catch (e) { return null; }
    }

    let res = await hitProxy(preferredMethod);
    if (res && res.success) return res;

    let fallbackMethod = preferredMethod === 'POST' ? 'GET' : 'POST';
    console.warn(`[OMNI] ${preferredMethod} failed. Auto-switching to ${fallbackMethod}...`);
    return await hitProxy(fallbackMethod);
}

// ==========================================
// 1. LOAD BATCHES 
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('new-batches');
    if (container) container.innerHTML = ''; 
    loadOldBatches();
    window.renderNextBatchChunk(); 
});

window.renderNextBatchChunk = async function() {
    if(isScanning || currentIndex >= MASTER_ID_LIST.length) return;
    isScanning = true;

    const progress = document.getElementById('progressBar');
    const loadBtn = document.getElementById('load-more-btn');
    if (loadBtn) { loadBtn.style.display = 'block'; loadBtn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Syncing Matrix..."; }
    if(progress) progress.style.width = '0%';
    
    const chunk = MASTER_ID_LIST.slice(currentIndex, currentIndex + SCAN_CHUNK_SIZE);
    let checked = 0;

    for (let i of chunk) {
        checked++;
        if (progress) progress.style.width = `${(checked / chunk.length) * 100}%`;
        
        try {
            // Using POST exactly as your cURL dictates
            const data = await engineFetch(API.OVERVIEW, 'POST', { course_id: String(i), parent_id: "0" });
            if (data && data.success && data.data && data.data.length > 0) {
                const overview = data.data.find(d => d.type === 'overview');
                if (overview && overview.data) {
                    const details = overview.data.find(l => l.layout_type === 'details');
                    if (details && details.layout_data && details.layout_data[0]) {
                        const batchInfo = details.layout_data[0];
                        const batchData = {
                            id: i, title: batchInfo.title, thumb: batchInfo.thumbnail || FALLBACK_IMG,
                            price: batchInfo.offer_price || 0, mrp: batchInfo.mrp || 0,
                            desc: batchInfo.description || "<p class='text-muted'>No description available.</p>"
                        };
                        window.masterBatches.push(batchData);
                        appendSingleBatch(batchData);
                    }
                }
            }
        } catch(e) {}
        await new Promise(r => setTimeout(r, 40));
    }
    currentIndex += SCAN_CHUNK_SIZE;
    isScanning = false;

    setTimeout(() => { const loader = document.getElementById('loaderContainer'); if(loader) loader.style.opacity = '0'; }, 500);
    if (loadBtn) {
        if (currentIndex >= MASTER_ID_LIST.length) loadBtn.style.display = 'none'; 
        else loadBtn.innerHTML = "Load More Batches";
    }
}

function appendSingleBatch(batch) {
    const container = document.getElementById('new-batches');
    const safeTitle = batch.title.replace(/'/g, "\\'");
    container.innerHTML += `
        <div class="glass-card">
            <img src="${batch.thumb}" class="course-img" onerror="this.src='${FALLBACK_IMG}'">
            <h3 class="course-title">${batch.title}</h3>
            <div style="color:var(--text-muted); font-size:14px; margin-bottom:10px;">₹${batch.price} <del>₹${batch.mrp}</del></div>
            <button class="btn-neon" onclick="openCourse(${batch.id})">Explore Vault</button>
        </div>`;
}

window.handleSearch = function() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const container = document.getElementById('new-batches');
    container.innerHTML = "";
    window.masterBatches.filter(b => b.title.toLowerCase().includes(term)).forEach(b => appendSingleBatch(b));
}

const oldBatchIds = [78, 62, 64, 81]; 
async function loadOldBatches() {
    const container = document.getElementById('old-batches');
    if (!container) return;
    container.innerHTML = "";
    for (let id of oldBatchIds) {
        try {
            const data = await engineFetch(API.OVERVIEW, 'POST', { course_id: String(id), parent_id: "0" });
            if (data && data.success && data.data && data.data.length > 0) {
                const overview = data.data.find(d => d.type === 'overview');
                if (overview && overview.data) {
                    const details = overview.data.find(l => l.layout_type === 'details');
                    if (details && details.layout_data && details.layout_data[0]) {
                        const batchInfo = details.layout_data[0];
                        const batchData = { 
                            id: id, title: batchInfo.title, thumb: batchInfo.thumbnail || FALLBACK_IMG,
                            desc: batchInfo.description || "<p class='text-muted'>No description available.</p>" 
                        };
                        window.masterBatches.push(batchData);
                        container.innerHTML += `
                            <div class="glass-card">
                                <img src="${batchData.thumb}" class="course-img" onerror="this.src='${FALLBACK_IMG}'">
                                <h3 class="course-title">${batchData.title}</h3>
                                <div style="color:var(--text-muted); font-size:14px; margin-bottom:10px;">Archived</div>
                                <button class="btn-neon" onclick="openCourse(${id})">Explore Vault</button>
                            </div>`;
                    }
                }
            }
        } catch(e) {}
    }
}

window.openCourse = function(courseId) {
    currentCourseId = courseId;
    const courseData = window.masterBatches.find(b => b.id == courseId);
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('detail-view').style.display = 'block';
    document.getElementById('course-title').innerText = courseData ? courseData.title : 'Course Details';
    
    if (courseData && courseData.desc) {
        document.getElementById('overview').innerHTML = courseData.desc.replace(/<img/g, '<img style="max-width:100%; height:auto; border-radius:12px; margin:15px 0;"');
    } else {
        document.getElementById('overview').innerHTML = "No description available.";
    }
    
    window.scrollTo(0, 0);
    fetchLiveFeed(courseId);
    folderHistory = [{ id: "0", name: "Root Folder" }];
    fetchFolderContent("0");
}

window.closeCourse = function() { 
    document.getElementById('detail-view').style.display = 'none'; 
    document.getElementById('main-app').style.display = 'block'; 
}

// ==========================================
// 3. LIVE FEED (FAST ROOT SCANNER)
// ==========================================
async function fetchLiveFeed(courseId) {
    const liveContainer = document.getElementById('live-list-container');
    const liveSection = document.getElementById('live-section');
    if(!liveSection) return;

    liveSection.style.display = 'block';
    liveContainer.innerHTML = '<div class="text-center py-3"><i class="fas fa-spinner fa-spin text-muted"></i> Intercepting Live Schedule...</div>';

    try {
        let allLiveClasses = [];
        let scannedFolders = new Set(); 

        async function scanFolderTree(fId, depth) {
            if(depth > 4 || scannedFolders.has(fId)) return;
            scannedFolders.add(fId);

            try {
                let p_id = (fId === "0") ? "0" : fId; 
                let data = await engineFetch(API.CONTENT, 'POST', { course_id: String(courseId), folder_id: String(p_id), limit: "5000", page: "1", parent_course_id: "0" });
                
                let items = [];
                if (data && data.data) {
                    if (Array.isArray(data.data)) items = data.data;
                    else if (Array.isArray(data.data.list)) items = data.data.list;
                }

                let subFolders = [];

                for (let item of items) {
                    const type = (item.type || "").toLowerCase();
                    const d = item.data || {};
                    const id = d.id || item.entity_id || item.id;
                    let vType = parseInt(item.video_type || d.video_type || 0);

                    if (vType === 3) {
                        item.parent_folder_id = fId; 
                        allLiveClasses.push(item);
                    } else if (type === 'folder' || type === 'subject' || type === 'chapter') {
                        subFolders.push(id);
                    }
                }
                for (let subId of subFolders) await scanFolderTree(subId, depth + 1);
            } catch (e) {}
        }

        await scanFolderTree("0", 1);

        allLiveClasses.sort((a, b) => {
            let tA = parseInt(a.live_from || a.data?.live_from || 0);
            let tB = parseInt(b.live_from || b.data?.live_from || 0);
            return tA - tB;
        });

        if (allLiveClasses.length === 0) { 
            liveContainer.innerHTML = `<div class="text-center text-muted py-3">No upcoming live classes right now.</div>`; return; 
        }

        let html = ''; let now = Date.now();

        allLiveClasses.forEach(item => {
            const d = item.data || {};
            const id = d.id || item.entity_id || item.id;
            const parentId = item.parent_folder_id || "0"; 
            const titleText = item.title || d.title || "Live Class";
            const safeTitle = encodeURIComponent(titleText);
            const thumb = item.thumbnail || d.thumbnail || FALLBACK_IMG;
            
            let rawTime = item.live_from || d.live_from || item.created_at || d.created_at || 0;
            let liveFrom = parseInt(rawTime, 10);
            if(isNaN(liveFrom)) liveFrom = 0;
            liveFrom = liveFrom * 1000;
            let diff = liveFrom - now;

            let lStatus = parseInt(item.live_status !== undefined ? item.live_status : (d.live_status || -1));

            let dateString = "Time not set";
            if (liveFrom > 0) {
                dateString = new Date(liveFrom).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
            }

            let tagHtml = ''; let btnHtml = '';

            if (lStatus === 0) {
                let timeStr = "Soon";
                if (liveFrom > 0 && diff > 0) {
                    let h = Math.floor(diff / 3600000);
                    let m = Math.floor((diff % 3600000) / 60000);
                    timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
                }
                tagHtml = `<span style="background:#f59e0b; padding:2px 6px; border-radius:4px; font-size:10px; color:#000; font-weight:bold; margin-left:5px;">🕒 SCHEDULED</span>`;
                btnHtml = `<button class="btn-neon" disabled style="opacity: 0.5; cursor:not-allowed;"><i class="fas fa-lock"></i> Starts in ${timeStr}</button>`;
            } 
            else {
                tagHtml = '<span style="background:#ef4444; padding:2px 6px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:5px;">🔥 LIVE NOW</span>';
                btnHtml = `<button class="play-btn" onclick="executeMediaAction('${id}', '${parentId}', '${safeTitle}', true)"><i class="fas fa-satellite-dish"></i> Join Live</button>`;
            }

            html += `
            <div class="folder-item">
                <div class="thumb-container">
                    <img src="${thumb}" class="content-thumb" onerror="this.src='${FALLBACK_IMG}'">
                    <div>
                        <h4 style="margin:0; font-size:15px;">${titleText} ${tagHtml}</h4>
                        <small style="color: var(--primary-neon);"><i class="far fa-clock"></i> ${dateString}</small>
                    </div>
                </div>
                <div>${btnHtml}</div>
            </div>`;
        });
        liveContainer.innerHTML = html;
    } catch(e) { liveContainer.innerHTML = '<p class="text-danger text-center">Failed to fetch live feed.</p>'; }
}

// ==========================================
// 4. VOD CONTENT FOLDERS
// ==========================================
window.fetchFolderContent = async function(folderId) {
    const listDiv = document.getElementById('content-list');
    listDiv.innerHTML = "<div class='text-center py-5'><i class='fas fa-spinner fa-spin fa-2x text-muted'></i></div>";
    
    const navDiv = document.getElementById('folder-nav');
    if (navDiv) {
        navDiv.innerHTML = folderHistory.length > 1 
            ? `<button class="btn btn-link text-decoration-none" style="color:var(--primary-neon); padding:0;" onclick="folderHistory.pop(); fetchFolderContent(folderHistory[folderHistory.length-1].id);"><i class="fas fa-level-up-alt"></i> Go Up</button> <h5 class="mt-2"><i class="fas fa-folder-open text-warning me-2"></i> ${folderHistory[folderHistory.length-1].name}</h5>` 
            : "";
    }

    const data = await engineFetch(API.CONTENT, 'POST', { course_id: String(currentCourseId), folder_id: String(folderId), limit: "5000", page: "1", parent_course_id: "0" });
    listDiv.innerHTML = "";
    
    let items = [];
    if (data && data.data) {
        if (Array.isArray(data.data)) items = data.data;
        else if (Array.isArray(data.data.list)) items = data.data.list;
    }

    if(items.length === 0) { listDiv.innerHTML = `<div class="text-center text-muted py-5">Folder is empty.</div>`; return; }

    let now = Date.now();

    items.forEach((item, idx) => {
        const type = (item.type || "").toLowerCase();
        const d = item.data || {};
        const isFolder = type === 'folder' || type === 'subject' || type === 'chapter';
        const isTest = type === 'test' || type === 'quiz';
        
        const safeTitle = (item.title || "Untitled").replace(/'/g, "\\'");
        const encodedTitle = encodeURIComponent(item.title || "Untitled");
        const thumb = item.thumbnail || d.thumbnail || FALLBACK_IMG;
        const contentId = d.id || item.entity_id || item.id;

        let vType = parseInt(item.video_type || d.video_type || 0);
        let fileType = parseInt(item.file_type || d.file_type || 0);
        let isVideo = type === 'video' || fileType === 2 || vType === 3;

        let liveTag = ''; let btnText = isVideo ? 'Play Video' : 'Open Content';
        let routeToLivePHP = false; let isBtnDisabled = false;

        let rawTime = item.live_from || d.live_from || item.created_at || d.created_at || 0;
        let liveFrom = parseInt(rawTime, 10);
        if(isNaN(liveFrom)) liveFrom = 0;
        liveFrom = liveFrom * 1000;
        let diff = liveFrom - now;

        let lStatus = parseInt(item.live_status !== undefined ? item.live_status : (d.live_status || -1));
        
        let dateString = "";
        if (liveFrom > 0 && vType === 3) {
            dateString = new Date(liveFrom).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
        }

        if (vType === 3) {
            if (lStatus === 0) {
                let timeStr = "Soon";
                if (liveFrom > 0 && diff > 0) {
                    let h = Math.floor(diff / 3600000);
                    let m = Math.floor((diff % 3600000) / 60000);
                    timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
                }
                liveTag = ` <span style="background:#f59e0b; padding:2px 6px; border-radius:4px; font-size:10px; color:#000; font-weight:bold; margin-left:5px;">🕒 SCHEDULED</span>`;
                btnText = `<i class="fas fa-lock"></i> Starts in ${timeStr}`;
                routeToLivePHP = false; isBtnDisabled = true;
            } else {
                liveTag = ' <span style="background:#ef4444; padding:2px 6px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:5px;">🔥 LIVE NOW</span>';
                btnText = '<i class="fas fa-satellite-dish"></i> Join Live'; routeToLivePHP = true; 
            }
        } else if (isVideo) {
            liveTag = ' <span style="background:#64748b; padding:2px 6px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:5px;">RECORDED</span>';
            btnText = '<i class="fas fa-play"></i> Watch Recording'; routeToLivePHP = false; 
        }

        let badgeText = isFolder ? 'Folder' : (routeToLivePHP ? 'Live Session' : (isVideo ? 'Video' : (isTest ? 'Test' : 'Document')));
        let dateHtml = dateString ? `<br><small style="color: var(--primary-neon);"><i class="far fa-clock"></i> ${dateString}</small>` : "";

        let actionHtml = '';
        if (isFolder) {
            actionHtml = `<button class="btn-neon" onclick="folderHistory.push({id:'${contentId}', name:'${safeTitle}'}); fetchFolderContent('${contentId}');">Open Folder</button>`;
        } else if (isBtnDisabled) {
            actionHtml = `<button class="btn-neon" disabled style="opacity:0.5;">${btnText}</button>`;
        } else {
            let btnClass = routeToLivePHP ? 'play-btn' : 'btn-neon';
            actionHtml = `<button class="${btnClass}" onclick="executeMediaAction('${contentId}', '${folderId}', '${encodedTitle}', ${routeToLivePHP})">${btnText}</button>`;
        }
        
        listDiv.innerHTML += `
            <div class="folder-item">
                <div class="thumb-container">
                    <img src="${thumb}" class="content-thumb" onerror="this.src='${FALLBACK_IMG
