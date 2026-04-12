// chunks/core-engine-v2.js
// ⚠️ YAHAN APNA VERCEL BACKEND URL DAALO (jaise https://sp-engine.vercel.app/api/v1)
const SP_API = 'https://sp-api-theta.vercel.app/api/v1'; 

let currentCourseId = null;
let folderHistory = [];
window.masterBatches = [];

window.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('progressBar').style.width = '50%';
    try {
        const response = await fetch(`${SP_API}/get-batches`, { method: 'POST' });
        const data = await response.json();
        
        document.getElementById('progressBar').style.width = '100%';
        setTimeout(() => { document.getElementById('loaderContainer').style.opacity = '0'; }, 500);

        if (data.success && data.batches) {
            data.batches.forEach(batch => {
                window.masterBatches.push({ id: batch.id, title: batch.data.title, thumb: batch.data.thumbnail });
                appendSingleBatch(batch.id, batch.data);
            });
        }
    } catch(e) { console.error("API Engine is offline."); }
});

function appendSingleBatch(id, batch) {
    const container = document.getElementById('new-batches');
    const safeTitle = batch.title.replace(/'/g, "\\'");
    const thumb = batch.thumbnail || 'https://i.ibb.co/dJbZq97B/2671188-1-logo.jpg';

    container.innerHTML += `
        <div class="course-card animate-slide-up">
            <img src="${thumb}" class="course-img">
            <div class="course-content">
                <h3 class="course-title">${batch.title}</h3>
                <button class="btn-fill w-100" onclick="openCourse('${id}', '${safeTitle}', '${batch.description ? batch.description.replace(/'/g, "\\'") : ''}')">Explore View</button>
            </div>
        </div>`;
}

window.handleSearch = function() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const container = document.getElementById('new-batches');
    container.innerHTML = "";
    window.masterBatches.filter(b => b.title.toLowerCase().includes(term)).forEach(b => {
        appendSingleBatch(b.id, b);
    });
}

window.openCourse = function(courseId, courseTitle, desc) {
    currentCourseId = courseId;
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('detail-view').style.display = 'block';
    document.getElementById('course-title').innerText = courseTitle;
    document.getElementById('overview').innerHTML = desc;
    window.scrollTo(0, 0);
    
    fetchLiveFeed(courseId);
    folderHistory = [{ id: "0", name: "Root Folder" }];
    fetchFolderContent("0");
}

window.closeCourse = function() { 
    document.getElementById('detail-view').style.display = 'none'; 
    document.getElementById('main-app').style.display = 'block'; 
}

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