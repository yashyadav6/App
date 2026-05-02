// ==========================================================
// STUDYPARCHAM PREMIUM VERCEL ENGINE (GOD MODE)
// Vercel Proxy + Smooth Red UI + Anti-Crash JSON Extractor
// ==========================================================

const SP_PROXY = 'https://sp-api-theta.vercel.app/api/v1/proxy'; // 🚨 BACK TO VERCEL
const FALLBACK_IMG = "https://i.ibb.co/dJbZq97B/2671188-1-logo.jpg";

const API = {
    OVERVIEW: 'https://course.nexttoppers.com/course/course-details',
    CONTENT: 'https://course.nexttoppers.com/course/all-content',
    MEDIA: 'https://course.nexttoppers.com/course/content-details'
};

// 🚨 STRICT HEADERS (Latest VIP Token)
const NT_HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'app_id': '1770981347',
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyNjU4NDc0LCJhcHBfaWQiOiIxNzcwOTgxMzQ3IiwiZGV2aWNlX2lkIjoiNTBjYzQ4NTUtMmE2ZC00MDBhLWJjYzgtZDVjYWVjYjg0ODMwIiwicGxhdGZvcm0iOiIzIiwidXNlcl90eXBlIjoxLCJpYXQiOjE3Nzc1NzM1OTEsImV4cCI6MTc4MDE2NTU5MX0.fun27F-NaHY7v5fNzGp44k7NoBI0YESdO8-_z2bzY7M',
    'content-type': 'application/json',
    'origin': 'https://nexttoppers.com',
    'platform': '3',
    'referer': 'https://nexttoppers.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'user_id': '682065',
    'version': '1'
};

// Premium Smooth Red Button Styles
const RED_BTN_STYLE = `background: linear-gradient(135deg, #ef4444, #b91c1c); color: white; border: none; border-radius: 30px; padding: 10px 20px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;`;
const RED_BTN_HOVER = `this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(239, 68, 68, 0.6)';`;
const RED_BTN_OUT = `this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(239, 68, 68, 0.4)';`;

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
// 🛡️ OMNI-FETCHER (THE DOUBLE-TAP AUTH INJECTOR)
// ==========================================
async function engineFetch(targetUrl, preferredMethod, payload = null) {
    async function hitProxy(methodToTry) {
        try {
            // 🚨 MASTER FIX: Injecting VIP Auth directly into real HTTP Headers!
            // This forces blind proxies like Vercel to forward the token natively.
            const realHttpHeaders = {
                'Content-Type': 'application/json',
                'app_id': NT_HEADERS.app_id,
                'authorization': NT_HEADERS.authorization,
                'user_id': NT_HEADERS.user_id,
                'platform': NT_HEADERS.platform,
                'version': NT_HEADERS.version
            };

            const response = await fetch(SP_PROXY, {
                method: 'POST', // Always POST to proxy to carry the instructions
                headers: realHttpHeaders, // Real HTTP headers
                body: JSON.stringify({ 
                    target_url: targetUrl, 
                    method: methodToTry, 
                    payload: payload,
                    headers: NT_HEADERS // Fallback in body
                })
            });
            
            const text = await response.text();
            
            // Safe JSON Extraction (Bypasses Vercel/Host HTML garbage)
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

    // Phase 1: Try requested method
    let res = await hitProxy(preferredMethod);
    if (res && res.success) return res;

    // Phase 2: If blocked, Shape-Shift to opposite method!
    let fallbackMethod = preferredMethod === 'POST' ? 'GET' : 'POST';
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
        <div class="course-card animate-slide-up glass-card">
            <div class="thumb-box"><img src="${batch.thumb}" class="course-img" onerror="this.src='${FALLBACK_IMG}'"></div>
            <div class="course-content">
                <h3 class="course-title">${batch.title}</h3>
                <div class="course-price" style="margin-bottom:12px;">₹${batch.price} <span style="font-size:14px; color:var(--text-muted); text-decoration:line-through;">₹${batch.mrp}</span></div>
                <button style="${RED_BTN_STYLE}" onmouseover="${RED_BTN_HOVER}" onmouseout="${RED_BTN_OUT}" onclick="openCourse(${batch.id})"><i class="fas fa-layer-group"></i> Explore Batch</button>
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
                            <div class="course-card animate-slide-up glass-card">
                                <img src="${batchData.thumb}" class="course-img" onerror="this.src='${FALLBACK_IMG}'">
                                <div class="course-content">
                                    <h3 class="course-title">${batchData.title}</h3>
                                    <div class="course-price" style="color:var(--text-muted); font-size:14px; margin-bottom:12px;">Archived Batch</div>
                                    <button style="${RED_BTN_STYLE}" onmouseover="${RED_BTN_HOVER}" onmouseout="${RED_BTN_OUT}" onclick="openCourse(${id})"><i class="fas fa-layer-group"></i> Explore Batch</button>
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
// 3. LIVE FEED
// ==========================================
async function fetchLiveFeed(courseId) {
    const liveContainer = document.getElementById('live-list-container');
    const liveSection = document.getElementById('live-section');
    if(!liveSection) return;

    liveSection.style.display = 'block';
    liveContainer.innerHTML = '<div class="text-center py-4"><i class="fas fa-circle-notch fa-spin fa-2x text-danger mb-2"></i><br><span class="text-muted">Scanning Live Matrix...</span></div>';

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
            liveContainer.innerHTML = `<div class="text-center py-4" style="background: var(--bg-dark); border-radius: 12px; border: 1px dashed #333;"><p style="color: var(--text-muted); font-weight: 600; margin: 0;">No upcoming live classes right now.</p></div>`;
            return; 
        }

        let html = '';
        let now = Date.now();

        allLiveClasses.forEach(item => {
            const d = item.data || {};
            const id = d.id || item.entity_id || item.id;
            const parentId = item.parent_folder_id || "0"; 
            const titleText = item.title || d.title || "Live Class";
            const safeTitle = encodeURIComponent(titleText);
            const thumb = item.thumbnail || d.thumbnail || FALLBACK_IMG;
            
            let rawTime = item.live_from || d.live_from || item.start_date || item.created_at || 0;
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
                btnHtml = `<button style="${RED_BTN_STYLE} opacity:0.5;" disabled><i class="fas fa-lock"></i> Starts in ${timeStr}</button>`;
            } 
            else {
                tagHtml = '<span style="background:#ef4444; padding:2px 6px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:5px; animation: pulse 1s infinite;">🔥 LIVE NOW</span>';
                btnHtml = `<button style="${RED_BTN_STYLE}" onmouseover="${RED_BTN_HOVER}" onmouseout="${RED_BTN_OUT}" onclick="executeMediaAction('${id}', '${parentId}', '${safeTitle}', true, this)"><i class="fas fa-satellite-dish"></i> Join Live</button>`;
            }

            html += `
            <div class="folder-item animate-slide-up" style="display:flex; justify-content:space-between; align-items:center; background:var(--glass-bg); padding:15px; border-radius:12px; margin-bottom:12px; border: 1px solid var(--glass-border);">
                <div class="thumb-container" style="display:flex; align-items:center;">
                    <img src="${thumb}" style="width:120px; border-radius:8px; margin-right:15px; aspect-ratio:16/9; object-fit:cover;" onerror="this.src='${FALLBACK_IMG}'">
                    <div>
                        <h5 style="color: #fff; margin:0; font-size:16px;">${titleText} ${tagHtml}</h5>
                        <small style="color: #ef4444; font-size: 12px;"><i class="far fa-clock"></i> ${dateString}</small>
                    </div>
                </div>
                <div style="min-width: 140px;">${btnHtml}</div>
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
    listDiv.innerHTML = "<div class='text-center py-5'><i class='fas fa-circle-notch fa-spin fa-2x text-danger'></i><p class='mt-2 text-muted'>Syncing Vault...</p></div>";
    
    const navDiv = document.getElementById('folder-nav');
    if (navDiv) {
        navDiv.innerHTML = folderHistory.length > 1 
            ? `<button class="btn btn-link text-decoration-none" style="padding:0; color:#ef4444;" onclick="folderHistory.pop(); fetchFolderContent(folderHistory[folderHistory.length-1].id);"><i class="fas fa-level-up-alt"></i> Go Up</button> <h5 style="color: #fff; margin-top:10px;"><i class="fas fa-folder-open text-danger me-2"></i> ${folderHistory[folderHistory.length-1].name}</h5>` 
            : "";
    }

    const data = await engineFetch(API.CONTENT, 'POST', { course_id: String(currentCourseId), folder_id: String(folderId), limit: "5000", page: "1", parent_course_id: "0" });
    listDiv.innerHTML = "";
    
    let items = [];
    if (data && data.data) {
        if (Array.isArray(data.data)) items = data.data;
        else if (Array.isArray(data.data.list)) items = data.data.list;
    }

    if(items.length === 0) { 
        listDiv.innerHTML = `<div class="text-center py-5"><i class="fas fa-box-open fa-3x text-muted mb-3"></i><p class="text-muted" style="font-size: 18px;">Folder is empty.</p></div>`; 
        return; 
    }

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

        let liveTag = '';
        let btnText = '';
        let btnIcon = '';
        let routeToLivePHP = false; 
        let isBtnDisabled = false;

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
                btnText = `Starts in ${timeStr}`;
                btnIcon = "fa-lock";
                routeToLivePHP = false; 
                isBtnDisabled = true;
            } else {
                liveTag = ' <span style="background:#ef4444; padding:2px 6px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:5px; animation: pulse 1s infinite;">🔥 LIVE NOW</span>';
                btnText = 'Join Live';
                btnIcon = "fa-satellite-dish";
                routeToLivePHP = true; 
            }
        } else if (isVideo) {
            liveTag = ' <span style="background:#64748b; padding:2px 6px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:5px;">RECORDED</span>';
            btnText = 'Watch Recording';
            btnIcon = "fa-play-circle";
            routeToLivePHP = false; 
        } else {
            btnText = 'Open Content';
            btnIcon = "fa-external-link-alt";
        }

        let badgeText = isFolder ? 'Folder' : (routeToLivePHP ? 'Live Session' : (isVideo ? 'Video' : (isTest ? 'Test' : 'Document')));
        let dateHtml = dateString ? `<br><small style="color: #ef4444; font-size:11px;"><i class="far fa-clock"></i> ${dateString}</small>` : "";

        let actionHtml = '';
        if (isFolder) {
            actionHtml = `<button style="${RED_BTN_STYLE}" onmouseover="${RED_BTN_HOVER}" onmouseout="${RED_BTN_OUT}" onclick="folderHistory.push({id:'${contentId}', name:'${safeTitle}'}); fetchFolderContent('${contentId}');"><i class="fas fa-folder-open"></i> Open Folder</button>`;
        } else if (isBtnDisabled) {
            actionHtml = `<button style="${RED_BTN_STYLE} opacity: 0.5;" disabled><i class="fas ${btnIcon}"></i> ${btnText}</button>`;
        } else {
            actionHtml = `<button style="${RED_BTN_STYLE}" onmouseover="${RED_BTN_HOVER}" onmouseout="${RED_BTN_OUT}" onclick="executeMediaAction('${contentId}', '${folderId}', '${encodedTitle}', ${routeToLivePHP}, this)"><i class="fas ${btnIcon}"></i> ${btnText}</button>`;
        }
        
        listDiv.innerHTML += `
            <div class="folder-item animate-slide-up" style="display:flex; justify-content:space-between; align-items:center; background:var(--glass-bg); padding:15px; border-radius:12px; margin-bottom:12px; border: 1px solid var(--glass-border); animation-delay: ${idx * 0.05}s;">
                <div class="thumb-container" style="display:flex; align-items:center;">
                    <img src="${thumb}" style="width:120px; border-radius:8px; margin-right:15px; aspect-ratio:16/9; object-fit:cover;" onerror="this.src='${FALLBACK_IMG}'">
                    <div>
                        <h5 style="color: #fff; margin:0; font-size:15px;">${item.title}${liveTag}</h5>
                        <span class="badge bg-danger mt-1">${badgeText}</span>
                        ${dateHtml}
                    </div>
                </div>
                <div style="min-width: 140px;">${actionHtml}</div>
            </div>`;
    });
}

            
            
// ==========================================
// 5. THE MASTER MEDIA FETCHER
// ==========================================
window.executeMediaAction = async function(contentId, parentId, title, forceLiveRoute, btnElement) {
    const orgHtml = btnElement ? btnElement.innerHTML : "";

    if(btnElement) {
        btnElement.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Loading...';
        btnElement.style.opacity = '0.7';
        btnElement.disabled = true;
        btnElement.style.pointerEvents = 'none';
    }

    try {
        let mediaData = null;
        
        // Build explicit GET URLs to prevent proxy from dropping payload parameters
        const urlWithParent = `${API.MEDIA}?content_id=${contentId}&course_id=${currentCourseId}&parent_id=${parentId}`;
        const urlWithoutParent = `${API.MEDIA}?content_id=${contentId}&course_id=${currentCourseId}`;

        // 🚨 6-WAY BRUTE FORCE: Leaves no stone unturned!
        const attempts = [
            { url: urlWithoutParent, method: 'GET', payload: null }, 
            { url: urlWithParent, method: 'GET', payload: null }, 
            { url: API.MEDIA, method: 'POST', payload: { content_id: contentId, course_id: currentCourseId } },
            { url: API.MEDIA, method: 'POST', payload: { content_id: contentId, course_id: currentCourseId, parent_id: parentId } },
            { url: API.MEDIA, method: 'GET', payload: { content_id: contentId, course_id: currentCourseId } },
            { url: API.MEDIA, method: 'GET', payload: { content_id: contentId, course_id: currentCourseId, parent_id: parentId } }
        ];

        for (let att of attempts) {
            let res = await engineFetch(att.url, att.method, att.payload);
            if (res && res.success && res.data) { 
                mediaData = res.data; 
                break; 
            }
        }
        
        // Restore Button beautifully
        if(btnElement) {
            btnElement.innerHTML = orgHtml;
            btnElement.style.opacity = '1';
            btnElement.disabled = false;
            btnElement.style.pointerEvents = 'auto';
        }

        if (!mediaData) {
            alert("Matrix Firewall Blocked Request. Please try again."); 
            return; 
        }

        let mediaUrl = mediaData.file_url || "";
        if (!mediaUrl && mediaData.download_urls) { 
            try { 
                const urls = JSON.parse(mediaData.download_urls); 
                if (urls.length > 0) mediaUrl = urls[urls.length - 1].url; 
            } catch(e) {} 
        }

        let videoType = parseInt(mediaData.video_type || 0);

        // 🚀 LIVE ROUTE
        if (forceLiveRoute || videoType === 3) {
            let chatNode = mediaData.mqtt_live_cred ? (mediaData.mqtt_live_cred.public_chat_node || "") : "";
            const safeTitle = encodeURIComponent(title);
            const safeStream = encodeURIComponent(mediaUrl);
            
            let matrixUrl = `live.php?title=${safeTitle}&node=${chatNode}&stream=${safeStream}&videoId=${contentId}`;
            window.open(matrixUrl, '_blank');
            return;
        }

        // 🎬 VOD ROUTE (PDF, YouTube, M3U8)
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
                window.open(`player.php?url=${encodeURIComponent(mediaUrl)}&title=${title}`, '_blank');
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
        alert("Engine connection failed. Proxy might be down.");
    }
}
