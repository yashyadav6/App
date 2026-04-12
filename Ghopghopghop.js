// ==========================================================
// STUDYPARCHAM PREMIUM VERCEL ENGINE (GOD MODE)
// 100% Content Extraction | Thumbnails Everywhere
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
// 1. LOAD BATCHES (130 -> 60 Progressive)
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('new-batches');
    const progress = document.getElementById('progressBar');
    
    if (container) container.innerHTML = ''; 
    if (progress) progress.style.width = '0%';

    const START_ID = 130;
    const END_ID = 60;
    const TOTAL = START_ID - END_ID + 1;
    let checked = 0;

    for (let i = START_ID; i >= END_ID; i--) {
        checked++;
        if (progress) progress.style.width = `${(checked / TOTAL) * 100}%`;
        
        try {
            const data = await engineFetch(API.OVERVIEW, 'POST', { course_id: String(i), parent_id: "0" });
            
            if (data && data.success && data.data && data.data.length > 0) {
                const overview = data.data.find(d => d.type === 'overview');
                if (overview && overview.data) {
                    const details = overview.data.find(l => l.layout_type === 'details');
                    if (details && details.layout_data && details.layout_data[0]) {
                        const batchInfo = details.layout_data[0];
                        
                        window.masterBatches.push({
                            id: i,
                            title: batchInfo.title,
                            thumb: batchInfo.thumbnail || FALLBACK_IMG,
                            price: batchInfo.offer_price || 0,
                            mrp: batchInfo.mrp || 0,
                            desc: batchInfo.description || "<p class='text-muted'>No description available.</p>"
                        });
                        
                        appendSingleBatch(window.masterBatches[window.masterBatches.length - 1]);
                    }
                }
            }
        } catch(e) {}
        await new Promise(r => setTimeout(r, 40));
    }
    
    setTimeout(() => { 
        const loader = document.getElementById('loaderContainer');
        if(loader) loader.style.opacity = '0'; 
    }, 500);
});

function appendSingleBatch(batch) {
    const container = document.getElementById('new-batches');
    const safeTitle = batch.title.replace(/'/g, "\\'");
    const thumb = batch.thumb || FALLBACK_IMG;

    container.innerHTML += `
        <div class="course-card animate-slide-up">
            <div class="thumb-box">
                <img src="${thumb}" class="course-img" onerror="this.src='${FALLBACK_IMG}'">
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
// 3. LIVE FEED (With "No Live" Logic)
// ==========================================
async function fetchLiveFeed(courseId) {
    const liveContainer = document.getElementById('live-list-container');
    const liveSection = document.getElementById('live-section');
    if(!liveSection) return;

    liveSection.style.display = 'block';
    liveContainer.innerHTML = '<div class="text-center py-3"><i class="fas fa-spinner fa-spin text-muted"></i> Checking Live Feeds...</div>';

    const liveData = await engineFetch(API.LIVE, 'POST', { course_id: String(courseId) });
    let items = liveData?.data || [];
    let courseLives = items.filter(i => i.course_id == courseId || !i.course_id); 

    // NO LIVE CLASSES FALLBACK
    if (courseLives.length === 0) { 
        liveContainer.innerHTML = `
            <div class="text-center py-4" style="background: var(--bg-color); border-radius: 12px; border: 1px dashed var(--border-color);">
                <i class="fas fa-satellite-dish fa-2x text-muted mb-2"></i>
                <p style="color: var(--text-muted); font-weight: 600; margin: 0;">There are no live classes scheduled for this batch right now.</p>
            </div>`;
        return; 
    }

    let html = '';
    let now = Date.now();

    courseLives.forEach(d => {
        const safeTitle = encodeURIComponent(d.title);
        const thumb = d.thumbnail || FALLBACK_IMG;
        
        let liveFrom = parseInt(d.live_from) * 1000; 
        let liveTo = parseInt(d.live_to) * 1000;
        let diff = liveFrom - now;

        let tagHtml = ''; let btnHtml = '';

        if (d.live_status == 1 || (now >= liveFrom && now <= liveTo)) {
            tagHtml = '<span class="tag-live">🔥 LIVE NOW</span>';
            btnHtml = `<button class="play-btn" onclick="executeMediaAction('${d.id}', '${safeTitle}', true)"><i class="fas fa-satellite-dish"></i> Join Live</button>`;
        } else if (diff > 0) {
            let h = Math.floor(diff / 3600000);
            let m = Math.floor((diff % 3600000) / 60000);
            tagHtml = `<span class="tag-scheduled">STARTS IN ${h > 0 ? h + 'h ' : ''}${m}m</span>`;
            btnHtml = `<button class="btn-outline" disabled style="color:#aaa; border-color:#aaa;"><i class="fas fa-clock"></i> Scheduled</button>`;
        } else {
            tagHtml = '<span class="tag-completed">RECORDED</span>';
            btnHtml = `<button class="play-btn" style="background:var(--primary);" onclick="executeMediaAction('${d.id}', '${safeTitle}', false)"><i class="fas fa-play"></i> Watch</button>`;
        }

        html += `
        <div class="folder-item animate-slide-up">
            <div class="thumb-container">
                <img src="${thumb}" class="content-thumb" onerror="this.src='${FALLBACK_IMG}'">
                <div>
                    <h4 style="color: var(--text-main); margin:0;">${d.title} ${tagHtml}</h4>
                    <small style="color: var(--text-muted);"><i class="far fa-calendar"></i> ${new Date(liveFrom).toLocaleString()}</small>
                </div>
            </div>
            ${btnHtml}
        </div>`;
    });
    liveContainer.innerHTML = html;
}

// ==========================================
// 4. VOD CONTENT FOLDERS (EXTRACTS ALL FILES)
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

    // Setting limit to 5000 to ensure NO files are missed
    const data = await engineFetch(API.CONTENT, 'POST', { course_id: String(currentCourseId), folder_id: String(folderId), is_free: "", keyword: "", limit: "5000", page: "1", parent_course_id: "0" });
    listDiv.innerHTML = "";
    
    // Deep Extraction: Nexttoppers sometimes puts files in `data.data.list`
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
        // Universal Item Parsing (Folders, Subjects, Videos, PDFs, Tests)
        const isFolder = item.type === 'folder' || item.type === 'subject';
        const fileType = item.data?.file_type || 0;
        const isVideo = item.type === 'video' || fileType == 2;
        const isTest = item.type === 'test' || item.type === 'quiz';
        
        const safeTitle = (item.title || "Untitled").replace(/'/g, "\\'");
        const encodedTitle = encodeURIComponent(item.title || "Untitled");
        
        // 100% Thumbnail guarantee for every item
        const thumb = item.data?.thumbnail || item.thumbnail || FALLBACK_IMG;
        
        // Catching the exact ID depending on how Nexttoppers nested it
        const contentId = item.data?.id || item.entity_id || item.id;

        let badgeText = isFolder ? 'Folder' : (isVideo ? 'Video' : (isTest ? 'Test' : 'Document'));
        
        let actionHtml = isFolder 
            ? `<button class="btn-outline" onclick="folderHistory.push({id:'${contentId}', name:'${safeTitle}'}); fetchFolderContent('${contentId}');">Open Folder</button>` 
            : `<button class="play-btn" style="background:${isVideo ? '#ef4444' : '#3b82f6'};" onclick="executeMediaAction('${contentId}', '${encodedTitle}', false)">${isVideo ? 'Play Video' : 'Open Content'}</button>`;
        
        listDiv.innerHTML += `
            <div class="folder-item animate-slide-up" style="animation-delay: ${idx * 0.05}s;">
                <div class="thumb-container">
                    <img src="${thumb}" class="content-thumb" onerror="this.src='${FALLBACK_IMG}'">
                    <div>
                        <h4 style="color: var(--text-main); margin:0; font-weight:700;">${item.title}</h4>
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

    // Media Toast Loader
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
            // PDF Document
            if (mediaUrl.toLowerCase().endsWith('.pdf') || fileType == 3 || fileType == 1) {
                window.open(mediaUrl, '_blank');
            } 
            // YouTube Links
            else if (videoType == 1 || mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
                let ytId = mediaUrl;
                if(mediaUrl.includes('v=')) ytId = mediaUrl.split('v=')[1].substring(0, 11);
                else if(mediaUrl.includes('youtu.be/')) ytId = mediaUrl.split('youtu.be/')[1].substring(0, 11);
                window.open(`https://www.youtube.com/watch?v=${ytId}`, '_blank');
            } 
            // VOD M3U8 Player
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
