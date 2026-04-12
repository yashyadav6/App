// ⚠️ VERCEL API URL
const SP_API = 'https://sp-api-theta.vercel.app/api/v1'; 

let currentCourseId = null;
let folderHistory = [];
window.masterBatches = [];

window.addEventListener('DOMContentLoaded', async () => {
    // 1. Clear loaders
    document.getElementById('new-batches').innerHTML = ''; 
    document.getElementById('progressBar').style.width = '0%';

    // 2. Start Progressive Fast-Loader (130 to 60)
    const START_ID = 130;
    const END_ID = 60;
    const TOTAL = START_ID - END_ID + 1;
    let checked = 0;

    for(let i = START_ID; i >= END_ID; i--) {
        checked++;
        document.getElementById('progressBar').style.width = `${(checked / TOTAL) * 100}%`;
        
        try {
            // Vercel server se ek-ek ID check karwao
            const response = await fetch(`${SP_API}/check-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: i })
            });
            const result = await response.json();
            
            // Jaise hi batch mile, TURANT memory mein save karo aur screen par dikhao
            if (result && result.success && result.data) {
                window.masterBatches.push({ 
                    id: i, 
                    title: result.data.title, 
                    thumb: result.data.thumbnail,
                    desc: result.data.description || "<p class='text-muted'>No description available.</p>"
                });
                
                appendSingleBatch(i, result.data.title, result.data.thumbnail);
            }
        } catch(e) { console.warn("Skipped ID", i); }
        
        // UI ko freeze hone se bachane ke liye chota break
        await new Promise(r => setTimeout(r, 40));
    }
    
    setTimeout(() => { document.getElementById('loaderContainer').style.opacity = '0'; }, 500);
});

// HTML Breakage Fix: Ab button mein description pass nahi kar rahe hain. Sirf ID bhej rahe hain.
function appendSingleBatch(id, title, thumbnail) {
    const container = document.getElementById('new-batches');
    const thumb = thumbnail || 'https://i.ibb.co/dJbZq97B/2671188-1-logo.jpg';

    container.innerHTML += `
        <div class="course-card animate-slide-up">
            <img src="${thumb}" class="course-img">
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

// COURSE OPEN: Data array se uthayega, error nahi aayega!
window.openCourse = function(courseId) {
    currentCourseId = courseId;
    
    // Memory mein se batch ka data dhoondo
    const courseData = window.masterBatches.find(b => b.id == courseId);
    
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('detail-view').style.display = 'block';
    
    // Overview aur Title set karo
    document.getElementById('course-title').innerText = courseData ? courseData.title : 'Course Details';
    if(courseData && courseData.desc) {
        document.getElementById('overview').innerHTML = courseData.desc.replace(/<img/g, '<img style="max-width:100%; height:auto; border-radius:12px; margin:15px 0;"');
    } else {
        document.getElementById('overview').innerHTML = "<p class='text-muted'>No description available.</p>";
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

// LIVE CLASSES LOGIC (Intact)
async function fetchLiveFeed(courseId) {
    const liveContainer = document.getElementById('live-list-container');
    const response = await fetch(`${SP_API}/get-live`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ course_id: courseId })
    });
    const liveData = await response.json();
    let items = liveData?.data || [];
    let courseLives = items.filter(i => i.course_id == courseId || !i.course_id); 

    if (courseLives.length === 0) { document.getElementById('live-section').style.display = 'none'; return; }
    document.getElementById('live-section').style.display = 'block';
    
    let html = '';
    courseLives.forEach(d => {
        const safeTitle = (d.title).replace(/'/g, "\\'");
        html += `
        <div class="folder-item">
            <div class="thumb-container">
                <div><h4 style="color: var(--text-main); margin:0;">${d.title} <span class="tag-live">LIVE</span></h4></div>
            </div>
            <button class="play-btn" onclick="executeMediaAction('${d.id}', '${safeTitle}', true)">Join Live Room</button>
        </div>`;
    });
    liveContainer.innerHTML = html;
}

// VOD FOLDERS LOGIC (Intact)
window.fetchFolderContent = async function(folderId) {
    const listDiv = document.getElementById('content-list');
    listDiv.innerHTML = "<div class='text-center py-5'><i class='fas fa-spinner fa-spin fa-2x text-muted'></i></div>";
    
    const response = await fetch(`${SP_API}/get-content`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ course_id: String(currentCourseId), folder_id: String(folderId) })
    });
    const data = await response.json();
    listDiv.innerHTML = "";
    
    let items = data?.data || [];
    items.forEach(item => {
        const isFolder = item.type === 'folder';
        const safeTitle = item.title.replace(/'/g, "\\'");
        let isVideo = item.type === 'video' || (item.data && item.data.file_type == 2);
        
        let actionHtml = isFolder 
        ? `<button class="btn-outline" onclick="folderHistory.push({id:'${item.entity_id}', name:'${safeTitle}'}); fetchFolderContent('${item.entity_id}');">Open Folder</button>` 
        : `<button class="play-btn" style="background:${isVideo ? '#ef4444' : '#3b82f6'};" onclick="executeMediaAction('${item.entity_id}', '${safeTitle}', false)">${isVideo ? 'Play Video' : 'Open Document'}</button>`;
        
        listDiv.innerHTML += `
            <div class="folder-item">
                <div class="thumb-container"><div><h4 style="color: var(--text-main); margin:0; font-weight:700;">${item.title}</h4></div></div>
                ${actionHtml}
            </div>`;
    });
}

// MEDIA ROUTING LOGIC (Intact)
window.executeMediaAction = async function(contentId, title, isLiveAction) {
    const safeTitle = encodeURIComponent(title);
    if (isLiveAction) {
        window.open(`live.php?batchId=${currentCourseId}&videoId=${contentId}&title=${safeTitle}`, '_blank');
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
            window.open(`player.php?url=${encodeURIComponent(url)}&title=${safeTitle}`, '_blank');
        }
    }
}
