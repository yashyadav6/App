// core-engine.js - Hosted externally
const SP_API = 'https://sp-api-theta.vercel.app/api/v1'; 
const FALLBACK_IMG = "https://i.ibb.co/dJbZq97B/2671188-1-logo.jpg";

let currentCourseId = null;
let folderHistory = [];
window.masterBatches = [];

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('new-batches').innerHTML = ''; // Clear default spinner
    startFastEngine();
});

async function startFastEngine() {
    const START_ID = 130;
    const END_ID = 60;
    const TOTAL = START_ID - END_ID + 1;
    let checked = 0;

    // Fast Reverse Loop
    for (let i = START_ID; i >= END_ID; i--) {
        checked++;
        document.getElementById('progressBar').style.width = `${(checked / TOTAL) * 100}%`;

        try {
            // Vercel Backend se ID check karo
            const response = await fetch(`${SP_API}/check-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: i })
            });
            const result = await response.json();

            if (result && result.success && result.data) {
                // Save data secretly in memory (Fixes the Overview Issue)
                window.masterBatches.push({
                    id: i,
                    title: result.data.title,
                    thumb: result.data.thumbnail,
                    desc: result.data.description || "<p class='text-muted'>No description available.</p>"
                });
                
                // INSTANT RENDER: Jaise hi mila, turant screen par daalo!
                appendSingleBatch(i, result.data.title, result.data.thumbnail);
            }
        } catch (e) {
            console.warn("Skipped", i);
        }
        // Bullet speed delay
        await new Promise(r => setTimeout(r, 40));
    }
    
    // Hide loader when done
    setTimeout(() => { document.getElementById('loaderContainer').style.opacity = '0'; }, 500);
}

function appendSingleBatch(id, title, thumbnail) {
    const container = document.getElementById('new-batches');
    const thumb = thumbnail || FALLBACK_IMG;
    
    // Sirf ID pass kar rahe hain, Description nahi, jisse HTML break nahi hoga
    container.innerHTML += `
        <div class="course-card animate-slide-up">
            <img src="${thumb}" class="course-img" onerror="this.src='${FALLBACK_IMG}'">
            <div class="course-content">
                <h3 class="course-title">${title}</h3>
                <button class="btn-fill w-100" onclick="openCourse('${id}')">Explore View</button>
            </div>
        </div>`;
}

window.handleSearch = function() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const container = document.getElementById('new-batches');
    container.innerHTML = "";
    window.masterBatches.filter(b => b.title.toLowerCase().includes(term)).forEach(b => {
        appendSingleBatch(b.id, b.title, b.thumb);
    });
}

// COURSE OPENING LOGIC
window.openCourse = function(courseId) {
    currentCourseId = courseId;
    
    // Find the saved description from memory
    const courseData = window.masterBatches.find(b => b.id == courseId);
    
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('detail-view').style.display = 'block';
    
    document.getElementById('course-title').innerText = courseData ? courseData.title : "Course Details";
    document.getElementById('overview').innerHTML = courseData ? courseData.desc.replace(/<img/g, '<img style="max-width:100%; height:auto; border-radius:12px; margin:15px 0;"') : "";
    
    window.scrollTo(0, 0);
    
    // Load Live & Content
    fetchLiveFeed(courseId);
    folderHistory = [{ id: "0", name: "Root Folder" }];
    fetchFolderContent("0");
}

window.closeCourse = function() { 
    document.getElementById('detail-view').style.display = 'none'; 
    document.getElementById('main-app').style.display = 'block'; 
}

// LIVE CLASSES
async function fetchLiveFeed(courseId) {
    const liveContainer = document.getElementById('live-list-container');
    const liveSection = document.getElementById('live-section');
    
    try {
        const response = await fetch(`${SP_API}/get-live`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ course_id: courseId })
        });
        const liveData = await response.json();
        let items = liveData?.data || [];
        let courseLives = items.filter(i => i.course_id == courseId || !i.course_id); 

        if (courseLives.length === 0) { liveSection.style.display = 'none'; return; }
        
        liveSection.style.display = 'block';
        let html = '';
        courseLives.forEach(d => {
            const safeTitle = encodeURIComponent(d.title);
            html += `
            <div class="folder-item">
                <div class="thumb-container">
                    <div><h4 style="color: var(--text-main); margin:0;">${d.title} <span class="tag-live">LIVE</span></h4></div>
                </div>
                <button class="play-btn" onclick="executeMediaAction('${d.id}', '${safeTitle}', true)">Join Live Room</button>
            </div>`;
        });
        liveContainer.innerHTML = html;
    } catch(e) { liveSection.style.display = 'none'; }
}

// VOD FOLDERS
window.fetchFolderContent = async function(folderId) {
    const listDiv = document.getElementById('content-list');
    listDiv.innerHTML = "<div class='text-center py-5'><i class='fas fa-spinner fa-spin fa-2x text-muted'></i></div>";
    
    // Update Breadcrumb
    const navDiv = document.getElementById('folder-nav');
    navDiv.innerHTML = folderHistory.length > 1 ? `<button class="back-nav" style="background:transparent; padding:0; margin-bottom:15px;" onclick="folderHistory.pop(); fetchFolderContent(folderHistory[folderHistory.length-1].id);"><i class="fas fa-level-up-alt"></i> Go Up</button> <h3 style="color: var(--text-main);"><i class="fas fa-folder-open text-warning me-2"></i> ${folderHistory[folderHistory.length-1].name}</h3>` : "";

    const response = await fetch(`${SP_API}/get-content`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ course_id: String(currentCourseId), folder_id: String(folderId) })
    });
    const data = await response.json();
    listDiv.innerHTML = "";
    
    let items = data?.data || [];
    if(items.length === 0) {
        listDiv.innerHTML = "<p class='text-center text-muted'>Folder is empty.</p>"; return;
    }

    items.forEach(item => {
        const isFolder = item.type === 'folder';
        const safeTitle = item.title.replace(/'/g, "\\'");
        const encodedTitle = encodeURIComponent(item.title);
        let isVideo = item.type === 'video' || (item.data && item.data.file_type == 2);
        let isPdf = item.type === 'pdf' || (item.data && item.data.file_type == 1);
        
        let actionHtml = isFolder 
        ? `<button class="btn-outline" onclick="folderHistory.push({id:'${item.entity_id}', name:'${safeTitle}'}); fetchFolderContent('${item.entity_id}');">Open Folder</button>` 
        : `<button class="play-btn" style="background:${isVideo ? '#ef4444' : '#3b82f6'};" onclick="executeMediaAction('${item.entity_id}', '${encodedTitle}', false)">${isVideo ? 'Play Video' : 'Open PDF'}</button>`;
        
        listDiv.innerHTML += `
            <div class="folder-item">
                <div class="thumb-container"><div><h4 style="color: var(--text-main); margin:0; font-weight:700;">${item.title}</h4></div></div>
                ${actionHtml}
            </div>`;
    });
}

// MEDIA ROUTING
window.executeMediaAction = async function(contentId, title, isLiveAction) {
    if (isLiveAction) {
        window.open(`live.php?batchId=${currentCourseId}&videoId=${contentId}&title=${title}`, '_blank');
        return;
    }

    const response = await fetch(`${SP_API}/get-media`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ content_id: contentId, course_id: currentCourseId })
    });
    const data = await response.json();
    
    if (data && data.success && data.data && data.data.file_url) {
        const url = data.data.file_url;
        if (url.toLowerCase().endsWith('.pdf') || data.data.file_type == 3 || data.data.file_type == 1) {
            window.open(url, '_blank');
        } else {
            window.open(`player.php?url=${encodeURIComponent(url)}&title=${title}`, '_blank');
        }
    } else {
        alert("Encrypted Media or Blocked by API.");
    }
}
