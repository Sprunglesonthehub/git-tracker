const graphContainer = document.getElementById("graph-container");
const loadingStatus = document.getElementById("loading-status");
const gitgraph = GitgraphJS.createGitgraph(graphContainer);

const API_URL = 'http://localhost:3000/api/repo-data';

async function fetchDataAndRender() {
    loadingStatus.textContent = 'Fetching latest data...';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderGraph(data.commits, data.branches);
        loadingStatus.textContent = 'Updated just now. Next update in 30 seconds.';
    } catch (error) {
        console.error("Error fetching or rendering graph:", error);
        loadingStatus.textContent = `Error: ${error.message}. Retrying in 30 seconds.`;
    }
}

function renderGraph(commits, branches) {
    gitgraph.clear();

    const commitData = commits.map(commit => ({
        sha: commit.sha,
        parents: commit.parents.map(p => p.sha),
        subject: commit.commit.message.split('\n')[0],
        author: `${commit.commit.author.name} <${commit.commit.author.email}>`,
    }));

    gitgraph.import(commitData);

    branches.forEach(branchData => {
        // Create a branch that points to a specific commit
        gitgraph.branch({
            name: branchData.name,
            from: branchData.commit.sha,
        });
    });
}


// Initial fetch and render
fetchDataAndRender();

// Poll for updates every 30 seconds
setInterval(fetchDataAndRender, 30000);
