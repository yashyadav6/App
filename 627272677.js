// ==========================================================
// STUDYPARCHAM PREMIUM VERCEL ENGINE (GOD MODE)
// Asli Media API Fetcher + Exact Time Lock & Converter
// ==========================================================

const SP_PROXY = 'https://sp-api-theta.vercel.app/api/v1/proxy'; 
const FALLBACK_IMG = "https://i.ibb.co/dJbZq97B/2671188-1-logo.jpg";

const API = {
    OVERVIEW: 'https://course.nexttoppers.com/course/course-details',
    LIVE: 'https://course.nexttoppers.com/live/get-live-feed',
    CONTENT: 'https://course.nexttoppers.com/course/all-content',
    MEDIA: 'https://course.nexttoppers.com/course/content-details'
};

let currentCourseId = null;
let folderHistory = [];
window.masterBatches = [];

// ==========================================
// 🎯 CUSTOM BATCH LIST GENERATOR
// ==========================================
let MASTER_ID_LIST = [];
for(let i = 179; i >= 175; i--) MASTER_ID_LIST.push(i);
for(let i = 124; i >= 122; i--) MASTER_ID_LIST.push(i);
for(let i = 112; i >= 100; i--) MASTER_ID_LIST.push(i);
for(let i = 99; i >= 50; i--) MASTER_ID_LIST.push(i);

let currentIndex = 0;
const SCAN_CHUNK_SIZE = 15; 
let isScanning = false;

// ==========================================
// UNIVERSAL SECURE FETCH FUNCTION
// ==========================================
async function engineFetch(targetUrl, method, payload = null) {
    try {
        const response = await fetch(SP_PROXY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_url: targetUrl, method: method, payload: payload })
        });
        return await response.json();
    } catch (e) {
        console.error("Engine Connection Blocked:", e);
        return null;
    }
}

// ==========================================
// ASLI DATA FETCHER (FROM MEDIA API)
// ==========================================
async function fetchTrueMediaDetails(cId, pId, eId) {
    try {
        let res = await engineFetch(`${API.MEDIA}?content_id=${eId}&course_id=${cId}&parent_id=${pId}`, 'GET');
        if (!res || !res.data) res = await engineFetch(API.MEDIA, 'POST', { content_id: eId, course_id: cId, parent_id: pId });
        return res?.data || null;
    } catch(e) { return null; }
}

// ==========================================
// 1. LOAD BATCHES & 2. OPEN COURSE (UNCHANGED)
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
    if (loadBtn) { loadBtn.style.display = 'block'; loadBtn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Scanning Engine..."; }
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
        <div class="course-card animate-slide-up">
            <div class="thumb-box"><img src="${batch.thumb}" class="course-img" onerror="this.src='${FALLBACK_IMG}'"></div>
            <div class="course-content">
                <h3 class="course-title">${batch.title}</h3>
                <div class="course-price">₹${batch.price} <span style="font-size:14px; color:var(--text-muted); text-decoration:line-through;">₹${batch.mrp}</span></div>
                <button class="btn-fill w-100" onclick="openCourse(${batch.id})">Explore View</button>
            </div>
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
                            <div class="course-card animate-slide-up">
                                <img src="${batchData.thumb}" class="course-img" onerror="this.src='${FALLBACK_IMG}'">
                                <div class="course-content">
                                    <h3 class="course-title">${batchData.title}</h3>
                                    <div class="course-price" style="color:var(--text-muted); font-size:16px;">Archived Batch</div>
                                    <div class="course-btns">
                                        <button class="btn-outline w-100" onclick="openCourse(${id})">Explore View</button>
                                    </div>
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
// 3. LIVE FEED (DEEP SCANNING WITH ASLI MEDIA FETCHER)
// ==========================================
async function fetchLiveFeed(courseId) {
    const liveContainer = document.getElementById('live-list-container');
    const liveSection = document.getElementById('live-section');
    if(!liveSection) return;

    liveSection.style.display = 'block';
    liveContainer.innerHTML = '<div class="text-center py-3"><i class="fas fa-spinner fa-spin text-muted"></i> Intercepting Final Live Data...</div>';

    try {
        let potentialClasses = [];
        let scannedFolders = new Set(); 

        async function scanFolderTree(fId, depth) {
            if(depth > 5 || scannedFolders.has(fId)) return;
            scannedFolders.add(fId);

            try {
                const data = await engineFetch(API.CONTENT, 'POST', { course_id: String(courseId), folder_id: String(fId), limit: "5000", page: "1", parent_course_id: "0" });
                let items = [];
                if (data && data.data) {
                    if (Array.isArray(data.data)) items = data.data;
                    else if (Array.isArray(data.data.list)) items = data.data.list;
                }

                let subFolders = [];

                items.forEach(item => {
                    const type = (item.type || "").toLowerCase();
                    const d = item.data || {};
                    const id = d.id || item.entity_id || item.id;
                    let vType = parseInt(d.video_type || 0);

                    // Grab potential lives to fetch true details
                    if (vType === 3 || type === 'live' || d.is_live == 1) {
                        item.parent_folder_id = fId; 
                        potentialClasses.push(item);
                    } else if (type === 'folder' || type === 'subject' || type === 'chapter') {
                        subFolders.push(id);
                    }
                });

                for (let subId of subFolders) await scanFolderTree(subId, depth + 1);
            } catch (e) {}
        }

        await scanFolderTree("0", 1);

        // 🚨 MAGIC: Fetch ASLI Data for potential classes
        let confirmedLives = [];
        await Promise.all(potentialClasses.map(async (item) => {
            const id = item.data?.id || item.entity_id || item.id;
            const parentId = item.parent_folder_id || "0";
            
            const trueData = await fetchTrueMediaDetails(currentCourseId, parentId, id);
            if (trueData) {
                item.true_media = trueData;
                confirmedLives.push(item);
            }
        }));

        confirmedLives.sort((a, b) => parseInt(a.true_media.live_from || 0) - parseInt(b.true_media.live_from || 0));

        if (confirmedLives.length === 0) { 
            liveContainer.innerHTML = `<div class="text-center py-4" style="background: var(--bg-color); border-radius: 12px; border: 1px dashed var(--border-color);"><i class="fas fa-satellite-dish fa-2x text-muted mb-2"></i><p style="color: var(--text-muted); font-weight: 600; margin: 0;">No upcoming live classes right now.</p></div>`;
            return; 
        }

        let html = '';
        let now = Date.now();

        confirmedLives.forEach(item => {
            const trueMedia = item.true_media;
            const id = trueMedia.id;
            const parentId = item.parent_folder_id || "0"; 
            const safeTitle = encodeURIComponent(trueMedia.title || item.title || "Live Class");
            const thumb = trueMedia.thumbnail || item.thumbnail || FALLBACK_IMG;
            
            let vType = parseInt(trueMedia.video_type || 0);
            if (vType !== 3) return; // ONLY TYPE 3

            let liveFrom = parseInt(trueMedia.live_from || 0) * 1000;
            let diff = liveFrom - now;
            let lStatus = parseInt(trueMedia.live_status);

            let tagHtml = ''; let btnHtml = '';
            let dateString = liveFrom > 0 ? new Date(liveFrom).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : "Time not set";

            // 🚨 MASTER LOGIC 🚨
            if (diff > 0) {
                // TIME HAS NOT COME -> BLOCK BUTTON
                let h = Math.floor(diff / 3600000);
                let m = Math.floor((diff % 3600000) / 60000);
                let tStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
                
                tagHtml = `<span class="tag-scheduled" style="background:#f59e0b; padding:2px 6px; border-radius:4px; font-size:10px; color:#000; font-weight:bold; margin-left:5px;">🕒 SCHEDULED</span>`;
                btnHtml = `<button class="btn-outline" disabled style="color:#aaa; border-color:#333; cursor:not-allowed; opacity: 0.6; background:transparent;"><i class="fas fa-lock"></i> Starts in ${tStr}</button>`;
            } 
            else {
                // TIME REACHED (diff <= 0) OR STATUS SAYS LIVE -> OPEN BUTTON
                tagHtml = '<span class="tag-live" style="background:#ef4444; padding:2px 6px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:5px; animation: pulse 1s infinite;">🔥 LIVE NOW</span>';
                btnHtml = `<button class="play-btn" style="background:#10b981; color:#fff;" onclick="executeMediaAction('${id}', '${parentId}', '${safeTitle}', true)"><i class="fas fa-satellite-dish"></i> Join Live</button>`;
            }

            html += `
            <div class="folder-item animate-slide-up">
                <div class="thumb-container">
                    <img src="${thumb}" class="content-thumb" onerror="this.src='${FALLBACK_IMG}'">
                    <div>
                        <h4 style="color: var(--text-main); margin:0;">${item.title} ${tagHtml}</h4>
                        <small style="color: #38bdf8; font-weight: bold; font-size: 11px;"><i class="far fa-clock"></i> Scheduled For: ${dateString}</small>
                    </div>
                </div>
                ${btnHtml}
            </div>`;
        });
        
        liveContainer.innerHTML = html || `<p class="text-muted text-center">No active type-3 streams.</p>`;
    } catch(e) {
        liveContainer.innerHTML = '<p class="text-danger text-center">Live feed error.</p>';
    }
}

// ==========================================
// 4. VOD CONTENT FOLDERS (ASLI MEDIA DATA INJECTION)
// ==========================================
window.fetchFolderContent = async function(folderId) {
    const listDiv = document.getElementById('content-list');
    listDiv.innerHTML = "<div class='text-center py-5'><i class='fas fa-spinner fa-spin fa-2x text-muted'></i><p class='mt-2 text-muted'>Syncing Vault...</p></div>";
    
    const navDiv = document.getElementById('folder-nav');
    if (navDiv) {
        navDiv.innerHTML = folderHistory.length > 1 
            ? `<button class="back-nav" style="background:transparent; padding:0; margin-bottom:15px; border:none; color:var(--primary);" onclick="folderHistory.pop(); fetchFolderContent(folderHistory[folderHistory.length-1].id);"><i class="fas fa-level-up-alt"></i> Go Up</button> <h3 style="color: var(--text-main);"><i class="fas fa-folder-open text-warning me-2"></i> ${folderHistory[folderHistory.length-1].name}</h3>` 
            : "";
    }

    const data = await engineFetch(API.CONTENT, 'POST', { course_id: String(currentCourseId), folder_id: String(folderId), limit: "5000", page: "1", parent_course_id: "0" });
    
    let items = [];
    if (data && data.data) {
        if (Array.isArray(data.data)) items = data.data;
        else if (Array.isArray(data.data.list)) items = data.data.list;
    }

    if(items.length === 0) { 
        listDiv.innerHTML = `<div class="text-center py-5"><i class="fas fa-box-open fa-3x text-muted mb-3"></i><p class="text-muted" style="font-size: 18px;">Folder is empty.</p></div>`; 
        return; 
    }

    // Render logic via Promise.all for ASLI Data
    let now = Date.now();
    let finalHtml = '';

    const processedItems = await Promise.all(items.map(async (item, idx) => {
        const type = (item.type || "").toLowerCase();
        const d = item.data || {};
        const isFolder = type === 'folder' || type === 'subject' || type === 'chapter';
        const isTest = type === 'test' || type === 'quiz';
        
        const safeTitle = (item.title || "Untitled").replace(/'/g, "\\'");
        const encodedTitle = encodeURIComponent(item.title || "Untitled");
        const thumb = d.thumbnail || item.thumbnail || FALLBACK_IMG;
        const contentId = d.id || item.entity_id || item.id;

        if (isFolder) {
            return `
            <div class="folder-item animate-slide-up" style="animation-delay: ${idx * 0.05}s;">
                <div class="thumb-container">
                    <img src="${thumb}" class="content-thumb" onerror="this.src='${FALLBACK_IMG}'">
                    <div>
                        <h4 style="color: var(--text-main); margin:0; font-weight:700;">${item.title}</h4>
                        <span class="badge" style="background: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; display:inline-block; margin-top:5px;">Folder</span>
                    </div>
                </div>
                <button class="btn-outline" onclick="folderHistory.push({id:'${contentId}', name:'${safeTitle}'}); fetchFolderContent('${contentId}');">Open Folder</button>
            </div>`;
        }

        // 🚨 MAGIC: Fetch ASLI Data from link endpoint!
        const trueMedia = await fetchTrueMediaDetails(currentCourseId, folderId, contentId);
        
        // Agar media fetch fail hua, default assume VOD
        let vType = trueMedia ? parseInt(trueMedia.video_type || 0) : parseInt(d.video_type || 0);
        let lStatus = trueMedia ? parseInt(trueMedia.live_status) : parseInt(d.live_status || -1);
        let liveFrom = trueMedia ? parseInt(trueMedia.live_from || 0) * 1000 : parseInt(d.live_from || 0) * 1000;
        let diff = liveFrom - now;

        let liveTag = '';
        let btnText = 'Play Video';
        let btnColor = '#ef4444';
        let routeToLivePHP = false; 
        let isBtnDisabled = false;
        let dateHtml = '';

        if (liveFrom > 0 && vType === 3) {
            let exactTime = new Date(liveFrom).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
            dateHtml = `<br><small style="color: #38bdf8; font-weight: bold; font-size:11px;"><i class="far fa-clock"></i> Scheduled For: ${exactTime}</small>`;
        }

        // 🚨 STRICT RULES FOR FOLDER VIEW
        if (vType === 3) {
            // RULE 1: TIME HAS NOT COME -> BLOCK
            if (liveFrom > 0 && diff > 0) {
                let h = Math.floor(diff / 3600000);
                let m = Math.floor((diff % 3600000) / 60000);
                let tStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
                
                liveTag = ` <span style="background:#f59e0b; padding:2px 6px; border-radius:4px; font-size:10px; color:#000; font-weight:bold; margin-left:5px;">🕒 SCHEDULED</span>`;
                btnText = `<i class="fas fa-lock"></i> Starts in ${tStr}`;
                routeToLivePHP = false; 
                isBtnDisabled = true;
            } 
            // RULE 2: TIME REACHED -> OPEN
            else {
                liveTag = ' <span style="background:#ef4444; padding:2px 6px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:5px; animation: pulse 1s infinite;">🔥 LIVE NOW</span>';
                btnText = '<i class="fas fa-satellite-dish"></i> Join Live';
                btnColor = '#10b981'; 
                routeToLivePHP = true; 
            }
        } else {
            // NORMAL RECORDED VIDEO (Type 4 or others)
            liveTag = ' <span style="background:#64748b; padding:2px 6px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:5px;">RECORDED</span>';
            btnText = '<i class="fas fa-play"></i> Watch Recording';
            btnColor = 'var(--primary)';
            routeToLivePHP = false; 
        }

        let badgeText = routeToLivePHP ? 'Live Session' : (isTest ? 'Test' : 'Video');
        let actionHtml = isBtnDisabled 
            ? `<button class="btn-outline" disabled style="color:#aaa; border-color:#333; cursor:not-allowed; opacity: 0.6; background:transparent;">${btnText}</button>`
            : `<button class="play-btn" style="background:${btnColor}; color:#fff;" onclick="executeMediaAction('${contentId}', '${folderId}', '${encodedTitle}', ${routeToLivePHP})">${btnText}</button>`;
        
        return `
            <div class="folder-item animate-slide-up" style="animation-delay: ${idx * 0.05}s;">
                <div class="thumb-container">
                    <img src="${thumb}" class="content-thumb" onerror="this.src='${FALLBACK_IMG}'">
                    <div>
                        <h4 style="color: var(--text-main); margin:0; font-weight:700;">${item.title}${liveTag}</h4>
                        <span class="badge" style="background: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; display:inline-block; margin-top:5px;">
                            ${badgeText}
                        </span>
                        ${dateHtml}
                    </div>
                </div>
                ${actionHtml}
            </div>`;
    }));

    listDiv.innerHTML = processedItems.join('');
}

// ==========================================
// 5. MEDIA ROUTING (GOLDMINE PAYLOAD INJECTOR)
// ==========================================
window.executeMediaAction = async function(contentId, parentId, title, forceLiveRoute) {
    const btn = document.activeElement;
    const orgHtml = btn ? btn.innerHTML : "Loading...";
    
    if(btn && (btn.classList.contains('play-btn') || btn.classList.contains('btn-outline'))) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    try {
        let data = await engineFetch(`${API.MEDIA}?content_id=${contentId}&course_id=${currentCourseId}&parent_id=${parentId}`, 'GET');
        
        if (!data || !data.data) {
            data = await engineFetch(API.MEDIA, 'POST', { content_id: contentId, course_id: currentCourseId, parent_id: parentId });
        }
        
        if(btn) btn.innerHTML = orgHtml;

        if (!data || !data.data) {
            alert("Security Block: Media Payload Missing. API blocked the request."); return;
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

        // 🚀 ROUTE 1: DIRECT LIVE MATRIX (NO DOUBLE FETCHING)
        if (forceLiveRoute || videoType === 3) {
            let liveFrom = mediaData.live_from || 0;
            // Chat node nikal lo
            let chatNode = mediaData.mqtt_live_cred ? (mediaData.mqtt_live_cred.public_chat_node || "") : "";
            
            const safeTitle = encodeURIComponent(title);
            const safeStream = encodeURIComponent(mediaUrl); // Seedha m3u8 link
            
            // Seedha link aur node pass kar rahe hain live.php ko
            let matrixUrl = `live.php?title=${safeTitle}&node=${chatNode}&stream=${safeStream}`;
            window.open(matrixUrl, '_blank');
            return;
        }

        // 🎬 ROUTE 2: NORMAL VOD (RECORDED)
        let fileType = mediaData.file_type; 
        if (mediaUrl) {
            if (mediaUrl.toLowerCase().endsWith('.pdf') || fileType == 3 || fileType == 1) {
                window.open(mediaUrl, '_blank');
            } else {
                window.open(`player.php?url=${encodeURIComponent(mediaUrl)}&title=${title}`, '_blank');
            }
        } else {
            alert("Failed to extract media token. Stream might be encrypted.");
        }
    } catch(e) {
        if(btn) btn.innerHTML = orgHtml;
        alert("Engine connection failed.");
    }
}
