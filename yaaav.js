// ==========================================================
// STUDYPARCHAM PREMIUM ENGINE (Vercel Edition)
// Parallel Scanning | Advanced IST Time | Adaptive Theme
// ==========================================================

const SP_PROXY = 'https://sp-api-theta.vercel.app/api/v1/proxy'; 
const FALLBACK_IMG = "https://i.ibb.co/dJbZq97B/2671188-1-logo.jpg";

const API = {
    OVERVIEW: 'https://course.nexttoppers.com/course/course-details',
    CONTENT: 'https://course.nexttoppers.com/course/all-content',
    MEDIA: 'https://course.nexttoppers.com/course/content-details'
};

/// 🚨 EXACT VIP HEADERS (Updated with Today's Fresh Token)
const NT_HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'app_id': '1770981347',
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyNjU4NDc0LCJhcHBfaWQiOiIxNzcwOTgxMzQ3IiwiZGV2aWNlX2lkIjoiZWJhNmI5NzYtOGI5OC00MmVjLWE0MDktMTgwNDc0NDM1YzhiIiwicGxhdGZvcm0iOiIzIiwidXNlcl90eXBlIjoxLCJpYXQiOjE3Nzc3OTQ5MjgsImV4cCI6MTc4MDM4NjkyOH0._Eh4JJM4VWsqZJPruRImIrLSCkmMDDq-ECs2BMpbz_g',
    'content-type': 'application/json',
    'origin': 'https://nexttoppers.com',
    'platform': '3',
    'referer': 'https://nexttoppers.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'user_id': '682065',
    'version': '1'
};

// Adaptive Button Styles (Fits both Dark and Light Themes)
const BTN_PRIMARY = `background: var(--primary-neon, #0ea5e9); color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(14, 165, 233, 0.3); width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;`;
const BTN_DANGER = `background: var(--accent-danger, #ef4444); color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;`;
const BTN_OUTLINE = `background: transparent; color: var(--text-muted, #64748b); border: 1px solid var(--border-color, #334155); border-radius: 8px; padding: 10px 20px; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;`;

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
// 🕒 ADVANCED TIME ENGINE (IST LOCKED)
// ==========================================
function formatIST(unixSeconds) {
    if (!unixSeconds || isNaN(unixSeconds) || unixSeconds <= 0) return "Time not set";
    const date = new Date(unixSeconds * 1000);
    return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
}

function getTimeDiffStr(unixSeconds) {
    if (!unixSeconds || isNaN(unixSeconds) || unixSeconds <= 0) return "Soon";
    const now = Date.now();
    const target = unixSeconds * 1000;
    const diff = target - now;
    if (diff <= 0) return "Started";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ==========================================
// 🛡️ OMNI-FETCHER WITH HEADER INJECTION
// ==========================================
async function engineFetch(targetUrl, methodToTry, payload = null) {
    try {
        const realHttpHeaders = {
            'Content-Type': 'application/json',
            'app_id': NT_HEADERS.app_id,
            'authorization': NT_HEADERS.authorization,
            'user_id': NT_HEADERS.user_id,
            'platform': NT_HEADERS.platform,
            'version': NT_HEADERS.version
        };

        const reqBody = {
            target_url: targetUrl, 
            method: methodToTry, 
            headers: NT_HEADERS 
        };
        
        if (payload && methodToTry === 'POST') reqBody.payload = payload;

        const response = await fetch(SP_PROXY, {
            method: 'POST', 
            headers: realHttpHeaders,
            body: JSON.stringify(reqBody)
        });
        
        const text = await response.text();
        
        try {
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
            }
        } catch(e) {}
        return null;
    } catch (e) {
        return null;
    }
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
    if (loadBtn) { loadBtn.style.display = 'block'; loadBtn.innerHTML = "<i class='fas fa-circle-notch fa-spin me-2'></i> Syncing Matrix..."; }
    if(progress) progress.style.width = '0%';
    
    const chunk = MASTER_ID_LIST.slice(currentIndex, currentIndex + SCAN_CHUNK_SIZE);
    let checked = 0;

    for (let i of chunk) {
        checked++;
        if (progress) progress.style.width = `${(checked / chunk.length) * 100}%`;
        
        try {
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
        await new Promise(r => setTimeout(r, 40)); // Throttle slightly to avoid rate limit
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
        <div class="course-card animate-slide-up" style="background: var(--glass-bg, #fff); border: 1px solid var(--glass-border, #e2e8f0); border-radius: 12px; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div class="thumb-box"><img src="${batch.thumb}" class="course-img" style="width:100%; border-radius:8px; aspect-ratio:16/9; object-fit:cover; margin-bottom:12px;" onerror="this.src='${FALLBACK_IMG}'"></div>
            <div class="course-content">
                <h3 class="course-title" style="color: var(--text-main, #1e293b); font-size:16px; font-weight:700; margin:0 0 8px 0;">${batch.title}</h3>
                <div class="course-price" style="margin-bottom:15px; color: var(--text-main, #1e293b); font-weight:600;">₹${batch.price} <span style="font-size:13px; color:var(--text-muted, #94a3b8); text-decoration:line-through; font-weight:400;">₹${batch.mrp}</span></div>
                <button style="${BTN_PRIMARY}" onclick="openCourse(${batch.id})"><i class="fas fa-layer-group"></i> Explore Batch</button>
            </div>
        </div>`;
}

window.handleSearch = function() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const container = document.getElementById('new-batches');
    container.innerHTML = "";
    window.masterBatches.filter(b => b.title.toLowerCase().includes(term)).forEach(b => appendSingleBatch(b));
}

async function loadOldBatches() {
    const oldBatchIds = [78, 62, 64, 81]; 
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
                            <div class="course-card animate-slide-up" style="background: var(--glass-bg, #fff); border: 1px solid var(--glass-border, #e2e8f0); border-radius: 12px; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                                <img src="${batchData.thumb}" class="course-img" style="width:100%; border-radius:8px; aspect-ratio:16/9; object-fit:cover; margin-bottom:12px;" onerror="this.src='${FALLBACK_IMG}'">
                                <div class="course-content">
                                    <h3 class="course-title" style="color: var(--text-main, #1e293b); font-size:16px; font-weight:700; margin:0 0 8px 0;">${batchData.title}</h3>
                                    <div class="course-price" style="color:var(--text-muted, #94a3b8); font-size:13px; margin-bottom:15px;">Archived Batch</div>
                                    <button style="${BTN_PRIMARY}" onclick="openCourse(${id})"><i class="fas fa-archive"></i> Explore Vault</button>
                                </div>
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
        document.getElementById('overview').innerHTML = "<p class='text-muted'>No description available.</p>";
    }
    
    if(document.querySelector('.tab-btn')) document.querySelector('.tab-btn').click();
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
// 3. LIVE FEED (FAST PARALLEL FETCHER)
// ==========================================
async function fetchLiveFeed(courseId) {
    const liveContainer = document.getElementById('live-list-container');
    const liveSection = document.getElementById('live-section');
    if(!liveSection) return;

    liveSection.style.display = 'block';
    liveContainer.innerHTML = '<div class="text-center py-5"><i class="fas fa-circle-notch fa-spin fa-2x text-danger mb-3"></i><br><span style="color:var(--text-muted, #64748b);">Scanning Live Matrix Fast...</span></div>';

    try {
        let allLiveClasses = [];
        let scannedFolders = new Set(); 

        async function scanFolderTree(fId, depth) {
            if(depth > 4 || scannedFolders.has(fId)) return;
            scannedFolders.add(fId);

            try {
                let p_id = (fId === "0") ? "0" : fId; 
                const payload = { course_id: String(courseId), folder_id: String(p_id), is_free: "", keyword: "", limit: "1000", page: "1", parent_course_id: "0" };

                let data = await engineFetch(API.CONTENT, 'POST', payload);
                let items = (data && data.data) ? (Array.isArray(data.data) ? data.data : (Array.isArray(data.data.list) ? data.data.list : [])) : [];

                let subFolders = [];

                for (let item of items) {
                    const type = (item.type || "").toLowerCase();
                    const d = item.data || {};
                    const id = d.id || item.entity_id || item.id;
                    let vType = parseInt(item.video_type || d.video_type || 0);

                    if (vType === 3) {
                        allLiveClasses.push(item);
                    } else if (type === 'folder' || type === 'subject' || type === 'chapter') {
                        subFolders.push(id);
                    }
                }
                
                // 🚨 FAST FETCH: Execute all subfolder requests simultaneously!
                const promises = subFolders.map(subId => scanFolderTree(subId, depth + 1));
                await Promise.all(promises);

            } catch (e) {}
        }

        await scanFolderTree("0", 1);

        allLiveClasses.sort((a, b) => {
            let tA = parseInt(a.live_from || a.data?.live_from || 0);
            let tB = parseInt(b.live_from || b.data?.live_from || 0);
            return tA - tB;
        });

        if (allLiveClasses.length === 0) { 
            liveContainer.innerHTML = `<div class="text-center py-4" style="background: var(--glass-bg, #f8fafc); border-radius: 12px; border: 1px dashed var(--border-color, #cbd5e1);"><p style="color: var(--text-muted, #64748b); font-weight: 600; margin: 0;">No upcoming live classes right now.</p></div>`;
            return; 
        }

        let html = '';

        allLiveClasses.forEach(item => {
            const d = item.data || {};
            const id = d.id || item.entity_id || item.id;
            const titleText = item.title || d.title || "Live Class";
            const safeTitle = encodeURIComponent(titleText);
            const thumb = item.thumbnail || d.thumbnail || FALLBACK_IMG;
            
            let rawTime = item.live_from || d.live_from || item.start_date || item.created_at || 0;
            let dateString = formatIST(rawTime);
            let timeStr = getTimeDiffStr(rawTime);
            let lStatus = parseInt(item.live_status !== undefined ? item.live_status : (d.live_status || -1));

            let tagHtml = ''; let btnHtml = '';

            if (lStatus === 0) {
                tagHtml = `<span style="background:#f59e0b; padding:3px 8px; border-radius:4px; font-size:10px; color:#000; font-weight:bold; margin-left:8px;">🕒 SCHEDULED</span>`;
                btnHtml = `<button style="${BTN_OUTLINE} cursor:not-allowed;" disabled><i class="fas fa-lock"></i> Starts in ${timeStr}</button>`;
            } 
            else {
                tagHtml = '<span style="background:#ef4444; padding:3px 8px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:8px; animation: pulse 1s infinite;">🔥 LIVE NOW</span>';
                btnHtml = `<button style="${BTN_DANGER}" onclick="executeMediaAction('${id}', '${safeTitle}', true, this)"><i class="fas fa-satellite-dish"></i> Join Live</button>`;
            }

            html += `
            <div class="folder-item animate-slide-up" style="display:flex; justify-content:space-between; align-items:center; background:var(--glass-bg, #fff); padding:15px; border-radius:12px; margin-bottom:12px; border: 1px solid var(--glass-border, #e2e8f0); box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div class="thumb-container" style="display:flex; align-items:center; flex:1;">
                    <img src="${thumb}" style="width:130px; border-radius:8px; margin-right:15px; aspect-ratio:16/9; object-fit:cover;" onerror="this.src='${FALLBACK_IMG}'">
                    <div>
                        <h5 style="color: var(--text-main, #1e293b); margin:0 0 5px 0; font-size:15px; font-weight:700;">${titleText} ${tagHtml}</h5>
                        <small style="color: var(--primary-neon, #0ea5e9); font-weight:600; font-size: 12px;"><i class="far fa-clock"></i> ${dateString}</small>
                    </div>
                </div>
                <div style="min-width: 150px; margin-left: 15px;">${btnHtml}</div>
            </div>`;
        });
        
        liveContainer.innerHTML = html;
    } catch(e) {
        liveContainer.innerHTML = '<p class="text-danger text-center">Failed to fetch live feed.</p>';
    }
}

// ==========================================
// 4. VOD CONTENT FOLDERS
// ==========================================
window.fetchFolderContent = async function(folderId) {
    const listDiv = document.getElementById('content-list');
    listDiv.innerHTML = "<div class='text-center py-5'><i class='fas fa-circle-notch fa-spin fa-2x text-primary'></i><p class='mt-3' style='color:var(--text-muted, #64748b);'>Syncing Vault...</p></div>";
    
    const navDiv = document.getElementById('folder-nav');
    if (navDiv) {
        navDiv.innerHTML = folderHistory.length > 1 
            ? `<button style="background:transparent; border:none; color:var(--primary-neon, #0ea5e9); font-weight:600; cursor:pointer; padding:0; display:flex; align-items:center; gap:5px; margin-bottom:15px;" onclick="folderHistory.pop(); fetchFolderContent(folderHistory[folderHistory.length-1].id);"><i class="fas fa-arrow-left"></i> Go Back</button> <h5 style="color: var(--text-main, #1e293b); font-weight:700;"><i class="fas fa-folder-open text-warning me-2"></i> ${folderHistory[folderHistory.length-1].name}</h5>` 
            : "";
    }

    const payload = { course_id: String(currentCourseId), folder_id: String(folderId), is_free: "", keyword: "", limit: "1000", page: "1", parent_course_id: "0" };

    const data = await engineFetch(API.CONTENT, 'POST', payload);
    listDiv.innerHTML = "";
    
    let items = [];
    if (data && data.data) {
        if (Array.isArray(data.data)) items = data.data;
        else if (Array.isArray(data.data.list)) items = data.data.list;
    }

    if(items.length === 0) { 
        listDiv.innerHTML = `<div class="text-center py-5"><i class="fas fa-folder-minus fa-3x mb-3" style="color:var(--text-muted, #cbd5e1);"></i><p style="color:var(--text-muted, #64748b); font-size: 16px;">Folder is empty.</p></div>`; 
        return; 
    }

    let html = '';

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

        let liveTag = ''; let btnText = ''; let btnIcon = '';
        let routeToLivePHP = false; let isBtnDisabled = false;

        let rawTime = item.live_from || d.live_from || item.created_at || d.created_at || 0;
        let dateString = formatIST(rawTime);
        let timeStr = getTimeDiffStr(rawTime);
        let lStatus = parseInt(item.live_status !== undefined ? item.live_status : (d.live_status || -1));

        if (vType === 3) {
            if (lStatus === 0) {
                liveTag = ` <span style="background:#f59e0b; padding:3px 8px; border-radius:4px; font-size:10px; color:#000; font-weight:bold; margin-left:8px;">🕒 SCHEDULED</span>`;
                btnText = `Starts in ${timeStr}`; btnIcon = "fa-lock";
                routeToLivePHP = false; isBtnDisabled = true;
            } else {
                liveTag = ' <span style="background:#ef4444; padding:3px 8px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:8px; animation: pulse 1s infinite;">🔥 LIVE NOW</span>';
                btnText = 'Join Live'; btnIcon = "fa-satellite-dish";
                routeToLivePHP = true; 
            }
        } else if (isVideo) {
            liveTag = ' <span style="background:#64748b; padding:3px 8px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:8px;">RECORDED</span>';
            btnText = 'Watch Recording'; btnIcon = "fa-play-circle"; routeToLivePHP = false; 
        } else {
            btnText = 'Open Content'; btnIcon = "fa-external-link-alt";
        }

        let badgeText = isFolder ? 'Folder' : (routeToLivePHP ? 'Live Session' : (isVideo ? 'Video' : (isTest ? 'Test' : 'Document')));
        let dateHtml = rawTime > 0 ? `<br><small style="color: var(--primary-neon, #0ea5e9); font-weight:600; font-size:11px;"><i class="far fa-clock"></i> ${dateString}</small>` : "";

        let actionHtml = '';
        if (isFolder) {
            actionHtml = `<button style="${BTN_PRIMARY}" onclick="folderHistory.push({id:'${contentId}', name:'${safeTitle}'}); fetchFolderContent('${contentId}');"><i class="fas fa-folder-open"></i> Open Folder</button>`;
        } else if (isBtnDisabled) {
            actionHtml = `<button style="${BTN_OUTLINE} cursor:not-allowed;" disabled><i class="fas ${btnIcon}"></i> ${btnText}</button>`;
        } else {
            let btnStyleToUse = routeToLivePHP ? BTN_DANGER : BTN_PRIMARY;
            actionHtml = `<button style="${btnStyleToUse}" onclick="executeMediaAction('${contentId}', '${encodedTitle}', ${routeToLivePHP}, this)"><i class="fas ${btnIcon}"></i> ${btnText}</button>`;
        }
        
        html += `
            <div class="folder-item animate-slide-up" style="display:flex; justify-content:space-between; align-items:center; background:var(--glass-bg, #fff); padding:15px; border-radius:12px; margin-bottom:12px; border: 1px solid var(--glass-border, #e2e8f0); box-shadow: 0 2px 4px rgba(0,0,0,0.02); animation-delay: ${idx * 0.05}s;">
                <div class="thumb-container" style="display:flex; align-items:center; flex:1;">
                    <img src="${thumb}" style="width:130px; border-radius:8px; margin-right:15px; aspect-ratio:16/9; object-fit:cover;" onerror="this.src='${FALLBACK_IMG}'">
                    <div>
                        <h5 style="color: var(--text-main, #1e293b); margin:0 0 5px 0; font-size:15px; font-weight:700;">${item.title}${liveTag}</h5>
                        <span style="background: var(--bg-main, #f1f5f9); border: 1px solid var(--border-color, #e2e8f0); color: var(--text-muted, #64748b); font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight:600; display:inline-block; margin-top:3px;">${badgeText}</span>
                        ${dateHtml}
                    </div>
                </div>
                <div style="min-width: 150px; margin-left: 15px;">${actionHtml}</div>
            </div>`;
    });
    
    listDiv.innerHTML = html;
}

// ==========================================
// 5. SNIPER MEDIA FETCHER (ZERO MATRIX ERROR)
// ==========================================
window.executeMediaAction = async function(contentId, title, forceLiveRoute, btnElement) {
    const orgHtml = btnElement ? btnElement.innerHTML : "";

    if(btnElement) {
        btnElement.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Loading...';
        btnElement.style.opacity = '0.7';
        btnElement.disabled = true;
        btnElement.style.pointerEvents = 'none';
    }

    try {
        // 🚨 STRICT EXACT REQUEST: GET with query params ONLY. No payload body.
        const exactApiUrl = `${API.MEDIA}?content_id=${contentId}&course_id=${currentCourseId}`;
        
        let data = await engineFetch(exactApiUrl, 'GET', null);
        
        if(btnElement) {
            btnElement.innerHTML = orgHtml;
            btnElement.style.opacity = '1';
            btnElement.disabled = false;
            btnElement.style.pointerEvents = 'auto';
        }

        if (!data || !data.data) {
            alert("tell the StudyParcham owner to change the token. Token might be expired."); 
            return; 
        }

        const mediaData = data.data;
        let mediaUrl = mediaData.file_url || "";
        
        if (!mediaUrl && mediaData.download_urls) { 
            try { 
                const urls = JSON.parse(mediaData.download_urls); 
                if (urls.length > 0) mediaUrl = urls[urls.length - 1].url; 
            } catch(e) {} 
        }

        let videoType = parseInt(mediaData.video_type || 0);

        if (forceLiveRoute || videoType === 3) {
            let chatNode = mediaData.mqtt_live_cred ? (mediaData.mqtt_live_cred.public_chat_node || "") : "";
            const safeTitle = encodeURIComponent(decodeURIComponent(title));
            const safeStream = encodeURIComponent(mediaUrl);
            
            let matrixUrl = `live.php?title=${safeTitle}&node=${chatNode}&stream=${safeStream}&videoId=${contentId}`;
            window.open(matrixUrl, '_blank');
            return;
        }

        let fileType = parseInt(mediaData.file_type || 0);
        if (mediaUrl) {
            if (mediaUrl.toLowerCase().endsWith('.pdf') || fileType === 3 || fileType === 1) {
                window.open(mediaUrl, '_blank');
            } 
            else if (videoType === 1 || mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
                let ytId = mediaUrl.includes('v=') ? mediaUrl.split('v=')[1].substring(0, 11) : mediaUrl.split('youtu.be/')[1].substring(0, 11);
                window.open(`https://www.youtube.com/watch?v=${ytId}`, '_blank');
            } 
            else {
                window.open(`player.php?url=${encodeURIComponent(mediaUrl)}&title=${encodeURIComponent(decodeURIComponent(title))}`, '_blank');
            }
        } else {
            alert("Failed to extract media token. Stream encrypted.");
        }
    } catch(e) {
        if(btnElement) {
            btnElement.innerHTML = orgHtml;
            btnElement.style.opacity = '1';
            btnElement.disabled = false;
            btnElement.style.pointerEvents = 'auto';
        }
        alert("Engine connection failed. Check your network.");
    }
}
