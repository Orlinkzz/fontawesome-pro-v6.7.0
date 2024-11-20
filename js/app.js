let allIcons = [];
let brandsIcons = [];
const ITEMS_PER_PAGE = 20;
let currentPageAll = 1;
let currentPageBrands = 1;
let currentIconType = 'solid'; // Default icon type

// Enable search functionality
function enableSearch() {
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
        const icons = activeTab === 'brands' ? brandsIcons : allIcons;
        const containerId = activeTab === 'brands' ? 'brandsList' : 'iconList';

        // Filter icons based on the search term
        const filteredIcons = icons.filter(icon => icon.toLowerCase().includes(searchTerm));
        renderIcons(filteredIcons, containerId, 1, currentIconType); // Render filtered icons
        updatePaginationControls(
            filteredIcons,
            1,
            activeTab === 'brands' ? 'pageInfoBrands' : 'pageInfoAll',
            activeTab === 'brands' ? 'prevPageBrands' : 'prevPageAll',
            activeTab === 'brands' ? 'nextPageBrands' : 'nextPageAll'
        );
    });
}

// Enable icon type switch functionality
function enableIconSwitch() {
    const iconTypeSwitch = document.getElementById('iconTypeSwitch');
    iconTypeSwitch.addEventListener('change', function () {
        currentIconType = this.value; // Update icon type
        const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
        const containerId = activeTab === 'brands' ? 'brandsList' : 'iconList';
        const icons = activeTab === 'brands' ? brandsIcons : allIcons;
        const currentPage = activeTab === 'brands' ? currentPageBrands : currentPageAll;

        // Re-render icons with the selected type
        renderIcons(icons, containerId, currentPage, currentIconType);
    });
}

// Fetch and parse CSS for icons
async function fetchIcons() {
    const cssFiles = [
        { file: 'css/icon/icon.css', type: 'all' },
        { file: 'css/icon/brands.css', type: 'brands' },
    ];

    for (const { file, type } of cssFiles) {
        const response = await fetch(file);
        const cssText = await response.text();
        const regex = /\.fa-[\w-]+/g;
        const matches = cssText.match(regex) || [];
        const icons = [...new Set(matches.map(match => match.slice(1)))];
        if (type === 'all') {
            allIcons = icons;
        } else {
            brandsIcons = icons;
        }
    }
}

// Render icons for a tab
function renderIcons(icons, containerId, page, iconType) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear existing icons

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const iconsToRender = icons.slice(startIndex, endIndex);

    iconsToRender.forEach(icon => {
        const faClass = containerId === 'brandsList' ? 'fa-brands' : `fa-${iconType}`;
        const iconItem = document.createElement('div');
        iconItem.className = 'icon-item flex flex-col items-center justify-center p-6 bg-gray-100 rounded-md hover:bg-gray-200 transition';
        iconItem.innerHTML = `
            <i class="${faClass} ${icon} fa-2xl m-4"></i>
            <span class="text-sm mt-4">${faClass} ${icon}</span>
        `;
        container.appendChild(iconItem);
    });
}

// Update pagination controls
function updatePaginationControls(totalIcons, currentPage, pageInfoId, prevButtonId, nextButtonId) {
    const totalPages = Math.ceil(totalIcons.length / ITEMS_PER_PAGE);
    const pageInfo = document.getElementById(pageInfoId);
    const prevPageButton = document.getElementById(prevButtonId);
    const nextPageButton = document.getElementById(nextButtonId);

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
}

// Setup pagination for a tab
function setupPagination(icons, containerId, currentPageRef, pageInfoId, prevButtonId, nextButtonId) {
    const prevPageButton = document.getElementById(prevButtonId);
    const nextPageButton = document.getElementById(nextButtonId);

    prevPageButton.addEventListener('click', () => {
        if (currentPageRef.current > 1) {
            currentPageRef.current--;
            renderIcons(icons, containerId, currentPageRef.current, currentIconType);
            updatePaginationControls(icons, currentPageRef.current, pageInfoId, prevButtonId, nextButtonId);
        }
    });

    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(icons.length / ITEMS_PER_PAGE);
        if (currentPageRef.current < totalPages) {
            currentPageRef.current++;
            renderIcons(icons, containerId, currentPageRef.current, currentIconType);
            updatePaginationControls(icons, currentPageRef.current, pageInfoId, prevButtonId, nextButtonId);
        }
    });
}

// Enable tab switching
function enableTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const iconTypeSwitch = document.getElementById('iconTypeSwitch'); // Akses dropdown iconTypeSwitch

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tab = this.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active', 'bg-gray-200'));
            this.classList.add('active', 'bg-gray-200');

            tabContents.forEach(content => {
                content.classList.toggle('hidden', content.getAttribute('data-tab') !== tab);
            });

            // Sembunyikan iconTypeSwitch jika tab adalah "brands"
            if (tab === 'brands') {
                iconTypeSwitch.classList.add('hidden');
            } else {
                iconTypeSwitch.classList.remove('hidden');
            }

            const icons = tab === 'brands' ? brandsIcons : allIcons;
            const containerId = tab === 'brands' ? 'brandsList' : 'iconList';
            const currentPageRef = tab === 'brands' ? { current: currentPageBrands } : { current: currentPageAll };

            renderIcons(icons, containerId, 1, currentIconType);
            updatePaginationControls(
                icons,
                1,
                tab === 'brands' ? 'pageInfoBrands' : 'pageInfoAll',
                tab === 'brands' ? 'prevPageBrands' : 'prevPageAll',
                tab === 'brands' ? 'nextPageBrands' : 'nextPageAll'
            );
        });
    });
}

// Initialize the app
(async function () {
    await fetchIcons();
    enableTabs();
    enableSearch();
    enableIconSwitch();

    const currentPageAllRef = { current: currentPageAll };
    const currentPageBrandsRef = { current: currentPageBrands };

    setupPagination(allIcons, 'iconList', currentPageAllRef, 'pageInfoAll', 'prevPageAll', 'nextPageAll');
    setupPagination(brandsIcons, 'brandsList', currentPageBrandsRef, 'pageInfoBrands', 'prevPageBrands', 'nextPageBrands');

    renderIcons(allIcons, 'iconList', currentPageAllRef.current, currentIconType);
})();
