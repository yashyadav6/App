// ==========================================================
// STUDYPARCHAM PREMIUM VERCEL ENGINE (GOD MODE + CHUNK LOADER)
// Custom Ranges + Smart Live/Scheduled Detector Active
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

// Range 1: 179 se 175 tak
for(let i = 179; i >= 175; i--) {
    MASTER_ID_LIST.push(i);
}

// Range 2: 124 se 122 tak
for(let i = 124; i >= 122; i--) {
    MASTER_ID_LIST.push(i);
}

// Range 3: 112 se 100 tak
for(let i = 112; i >= 100; i--) {
    MASTER_ID_LIST.push(i);
}

// Range 4: 99 se 50 tak
for(let i = 99; i >= 50; i--) {
    MASTER_ID_LIST.push(i);
}

// ⚙️ SCANNER STATE
let currentIndex = 0;
const SCAN_CHUNK_SIZE = 15; // Ek baar mein 15 load honge
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
// 1. LOAD BATCHES (Chunk System)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('new-batches');
    if (container) container.innerHTML = ''; 
    loadOldBatches();
    window.renderNextBatchChunk(); // Pehla chunk load karo
});

window.renderNextBatchChunk = async function() {
    // Agar scan chal raha hai ya list khatam ho gayi, toh ruk jao
    if(isScanning || currentIndex >= MASTER_ID_LIST.length) return;
    isScanning = true;

    const progress = document.getElementById('progressBar');
    const loadBtn = document.getElementById('load-more-btn');
    
    if (loadBtn) {
        loadBtn.style.display = 'block';
        loadBtn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Scanning Engine...";
    }

    if(progress) progress.style.width = '0%';
    
    // Sirf aage ke 15 IDs uthao
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
                            id: i,
                            title: batchInfo.title,
                            thumb: batchInfo.thumbnail || FALLBACK_IMG,
                            price: batchInfo.offer_price || 0,
                            mrp: batchInfo.mrp || 0,
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
    
    // Index ko aage badhao agle click ke liye
    currentIndex += SCAN_CHUNK_SIZE;
    isScanning = false;

    setTimeout(() => { 
        const loader = document.getElementById('loaderContainer');
        if(loader) loader.style.opacity = '0'; 
    }, 500);

    if (loadBtn) {
        if (currentIndex >= MASTER_ID_LIST.length) {
            loadBtn.style.display = 'none'; // Saare load ho gaye toh button hide kardo
        } else {
            loadBtn.innerHTML = "Load More Batches";
        }
    }
}

function appendSingleBatch(batch) {
    const container = document.getElementById('new-batches');
    const safeTitle = batch.title.replace(/'/g, "\\'");

    container.innerHTML += `
        <div class="course-card animate-slide-up">
            <div class="thumb-box">
                <img src="${batch.thumb}" class="course-img" onerror="this.src='${FALLBACK_IMG}'">
            </div>
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

// ARCHIVED BATCHES VIA VERCEL
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

// ==========================================
// 2. OPEN COURSE & INJECT OVERVIEW
// ==========================================
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
// 3. LIVE FEED (API DEAD - BYPASSED)
// ==========================================
async function fetchLiveFeed(courseId) {
    const liveSection = document.getElementById('live-section');
    
    // API dead hone ki wajah se top banner hide kar rahe hain
    if(liveSection) {
        liveSection.style.display = 'none';
    }
}

// ==========================================
// 4. VOD CONTENT FOLDERS (SMART LIVE DETECTION INJECTED)
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

    const data = await engineFetch(API.CONTENT, 'POST', { course_id: String(currentCourseId), folder_id: String(folderId), is_free: "", keyword: "", limit: "5000", page: "1", parent_course_id: "0" });
    listDiv.innerHTML = "";
    
    let items = [];
    if (Array.isArray(data?.data)) items = data.data;
    else if (Array.isArray(data?.data?.list)) items = data.data.list;

    if(items.length === 0) { 
        listDiv.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                <p class="text-muted" style="font-size: 18px;">Folder is empty.</p>
            </div>`; 
        return; 
    }

    items.forEach((item, idx) => {
        const isFolder = item.type === 'folder' || item.type === 'subject';
        const fileType = item.data?.file_type || 0;
        const isTest = item.type === 'test' || item.type === 'quiz';
        
        let isVideo = item.type === 'video' || fileType == 2;
        
        const safeTitle = (item.title || "Untitled").replace(/'/g, "\\'");
        const encodedTitle = encodeURIComponent(item.title || "Untitled");
        const thumb = item.data?.thumbnail || item.thumbnail || FALLBACK_IMG;
        const contentId = item.data?.id || item.entity_id || item.id;

        // 🚨 NEW: SMART LIVE DETECTOR 🚨
        let isLiveClass = false;
        let liveTag = '';
        let btnText = isVideo ? 'Play Video' : 'Open Content';
        let btnColor = isVideo ? '#ef4444' : '#3b82f6';
        let routeToLivePHP = false; // Default goes to VOD Player

        if (item.data && (item.data.is_live == 1 || item.data.live_status == 0 || item.data.live_status == 1 || item.type === 'live')) {
            isLiveClass = true;
            isVideo = true; 
            
            let liveStatus = parseInt(item.data.live_status || 0); 
            let liveFrom = parseInt(item.data.live_from || 0) * 1000;
            let now = Date.now();
            let diff = liveFrom - now;

            if (liveStatus === 1 || (now >= liveFrom && liveStatus !== 2 && liveFrom > 0)) {
                liveTag = ' <span style="background:#ef4444; padding:2px 6px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:5px; animation: pulse 1s infinite;">🔥 LIVE NOW</span>';
                btnText = '<i class="fas fa-satellite-dish"></i> Join Live';
                btnColor = '#10b981'; 
                routeToLivePHP = true; 
            } else if (liveStatus === 0 || diff > 0) {
                let h = Math.floor(diff / 3600000);
                let m = Math.floor((diff % 3600000) / 60000);
                let tStr = (h > 0 ? h + 'h ' : '') + m + 'm';
                liveTag = ` <span style="background:#f59e0b; padding:2px 6px; border-radius:4px; font-size:10px; color:#000; font-weight:bold; margin-left:5px;">🕒 STARTS IN ${tStr.toUpperCase()}</span>`;
                btnText = '<i class="fas fa-clock"></i> Waiting Room';
                btnColor = '#f59e0b'; 
                routeToLivePHP = true; 
            } else {
                liveTag = ' <span style="background:#64748b; padding:2px 6px; border-radius:4px; font-size:10px; color:#fff; font-weight:bold; margin-left:5px;">RECORDED</span>';
                btnText = '<i class="fas fa-play"></i> Watch Recording';
                routeToLivePHP = false; 
            }
        }

        let badgeText = isFolder ? 'Folder' : (isLiveClass ? 'Live Session' : (isVideo ? 'Video' : (isTest ? 'Test' : 'Document')));
        
        let actionHtml = isFolder 
            ? `<button class="btn-outline" onclick="folderHistory.push({id:'${contentId}', name:'${safeTitle}'}); fetchFolderContent('${contentId}');">Open Folder</button>` 
            : `<button class="play-btn" style="background:${btnColor}; color:#fff;" onclick="executeMediaAction('${contentId}', '${encodedTitle}', ${routeToLivePHP})">${btnText}</button>`;
        
        listDiv.innerHTML += `
            <div class="folder-item animate-slide-up" style="animation-delay: ${idx * 0.05}s;">
                <div class="thumb-container">
                    <img src="${thumb}" class="content-thumb" onerror="this.src='${FALLBACK_IMG}'">
                    <div>
                        <h4 style="color: var(--text-main); margin:0; font-weight:700;">${item.title}${liveTag}</h4>
                        <span class="badge" style="background: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; display:inline-block; margin-top:5px;">
                            ${badgeText}
                        </span>
                    </div>
                </div>
                ${actionHtml}
            </div>`;
    });
}

// ==========================================
// 5. MEDIA ROUTING
// ==========================================
window.executeMediaAction = async function(contentId, title, isLiveAction) {
    if (isLiveAction) {
        window.open(`live.php?batchId=${currentCourseId}&videoId=${contentId}&title=${title}`, '_blank');
        return;
    }

    const btn = document.activeElement;
    const orgHtml = btn ? btn.innerHTML : "Loading...";
    if(btn && btn.classList.contains('play-btn')) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const data = await engineFetch(`${API.MEDIA}?content_id=${contentId}&course_id=${currentCourseId}`, 'GET');
        if(btn && btn.classList.contains('play-btn')) btn.innerHTML = orgHtml;

        let mediaUrl = data?.data?.file_url || "";
        if (data?.data?.download_urls) { 
            try { 
                const urls = JSON.parse(data.data.download_urls); 
                if (urls.length > 0) mediaUrl = urls[urls.length - 1].url; 
            } catch(e) {} 
        }

        let fileType = data?.data?.file_type; 
        let videoType = data?.data?.video_type; 
        
        if (mediaUrl) {
            if (mediaUrl.toLowerCase().endsWith('.pdf') || fileType == 3 || fileType == 1) {
                window.open(mediaUrl, '_blank');
            } 
            else if (videoType == 1 || mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
                let ytId = mediaUrl;
                if(mediaUrl.includes('v=')) ytId = mediaUrl.split('v=')[1].substring(0, 11);
                else if(mediaUrl.includes('youtu.be/')) ytId = mediaUrl.split('youtu.be/')[1].substring(0, 11);
                window.open(`https://www.youtube.com/watch?v=${ytId}`, '_blank');
            } 
            else {
                window.open(`player.php?url=${encodeURIComponent(mediaUrl)}&title=${title}`, '_blank');
            }
        } else {
            alert("Failed to extract media token. Stream might be encrypted.");
        }
    } catch(e) {
        if(btn && btn.classList.contains('play-btn')) btn.innerHTML = orgHtml;
        alert("Engine connection failed.");
    }
}
