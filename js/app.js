let allIcons = [];
let brandsIcons = [];
const ITEMS_PER_PAGE = 20;
let currentPageAll = 1;
let currentPageBrands = 1;

function enableSearch() {
		const searchInput = document.getElementById('search');
		searchInput.addEventListener('input', function () {
				const searchTerm = this.value.toLowerCase();
				const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
				const icons = activeTab === 'brands' ? brandsIcons : allIcons;
				const containerId = activeTab === 'brands' ? 'brandsList' : 'iconList';

				// Filter icons based on the search term
				const filteredIcons = icons.filter(icon => icon.toLowerCase().includes(searchTerm));
				renderIcons(filteredIcons, containerId, 1); // Render filtered icons
		});
}

function enableIconSwitch() {
	const iconTypeSwitch = document.getElementById('iconTypeSwitch');
	iconTypeSwitch.addEventListener('change', function () {
			const selectedType = this.value; // Get selected type (e.g., 'light', 'regular', etc.)
			const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
			const containerId = activeTab === 'brands' ? 'brandsList' : 'iconList';

			// Re-render icons with the selected type
			if (activeTab === 'brands') {
					renderIcons(brandsIcons, containerId, 1, selectedType);
			} else {
					renderIcons(allIcons, containerId, 1, selectedType);
			}
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
function renderIcons(icons, containerId, page, iconType = 'solid') {
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
					<span class="text-sm mt-4">${faClass}  ${icon}</span>
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
function setupPagination(icons, containerId, currentPage, pageInfoId, prevButtonId, nextButtonId) {
	document.getElementById(prevButtonId).addEventListener('click', () => {
		if (currentPage > 1) {
			currentPage--;
			renderIcons(icons, containerId, currentPage);
			updatePaginationControls(icons, currentPage, pageInfoId, prevButtonId, nextButtonId);
		}
	});

	document.getElementById(nextButtonId).addEventListener('click', () => {
		const totalPages = Math.ceil(icons.length / ITEMS_PER_PAGE);
		if (currentPage < totalPages) {
			currentPage++;
			renderIcons(icons, containerId, currentPage);
			updatePaginationControls(icons, currentPage, pageInfoId, prevButtonId, nextButtonId);
		}
	});
}

// Handle tab switching
function enableTabs() {
	const tabButtons = document.querySelectorAll('.tab-button');
	const tabContents = document.querySelectorAll('.tab-content');

	tabButtons.forEach(button => {
			button.addEventListener('click', function () {
					const tab = this.getAttribute('data-tab');
					tabButtons.forEach(btn => {
							btn.classList.remove('active', 'bg-gray-200');
					});
					this.classList.add('active', 'bg-gray-200');
					tabContents.forEach(content => {
							content.classList.toggle('hidden', content.getAttribute('data-tab') !== tab);
					});
					const selectedType = document.getElementById('iconTypeSwitch').value;
					if (tab === 'brands') {
							renderIcons(brandsIcons, 'brandsList', 1, selectedType);
							updatePaginationControls(brandsIcons, 1, 'pageInfoBrands', 'prevPageBrands', 'nextPageBrands');
					} else {
							renderIcons(allIcons, 'iconList', 1, selectedType);
							updatePaginationControls(allIcons, 1, 'pageInfoAll', 'prevPageAll', 'nextPageAll');
					}
			});
	});
}

// Initialize
(async function () {
	await fetchIcons();
	enableTabs();
	enableSearch();
	enableIconSwitch();
	setupPagination(allIcons, 'iconList', currentPageAll, 'pageInfoAll', 'prevPageAll', 'nextPageAll'); 
	setupPagination(brandsIcons, 'brandsList', currentPageBrands, 'pageInfoBrands', 'prevPageBrands', 'nextPageBrands');
	renderIcons(allIcons, 'iconList', currentPageAll);
})();