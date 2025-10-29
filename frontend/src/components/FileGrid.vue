<template>
    <div class="space-y-6">
        <!-- Search and Filter Bar -->
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <!-- Search -->
                <div class="flex-1 max-w-lg">
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                        </div>
                        <input v-model="searchQuery" type="text" placeholder="Search files..."
                            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                </div>

                <!-- Filters -->
                <div class="flex items-center space-x-4">
                    <!-- Module Filter -->
                    <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-700">Module:</label>
                        <select v-model="selectedModule"
                            class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="">All Modules</option>
                            <option value="MediVault">MediVault</option>
                            <option value="BioKey">BioKey</option>
                            <option value="IPSeal">IPSeal</option>
                        </select>
                    </div>

                    <!-- Sort -->
                    <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-700">Sort:</label>
                        <select v-model="sortBy"
                            class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="date-desc">Date (Newest)</option>
                            <option value="date-asc">Date (Oldest)</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="size-desc">Size (Largest)</option>
                            <option value="size-asc">Size (Smallest)</option>
                        </select>
                    </div>

                    <!-- View Toggle -->
                    <div class="flex items-center space-x-1">
                        <button @click="viewMode = 'grid'"
                            :class="viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'"
                            class="p-2 rounded-md" title="Grid View">
                            <Squares2X2Icon class="h-5 w-5" />
                        </button>
                        <button @click="viewMode = 'list'"
                            :class="viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'"
                            class="p-2 rounded-md" title="List View">
                            <ListBulletIcon class="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Results Summary -->
        <div class="flex items-center justify-between">
            <p class="text-sm text-gray-700">
                Showing {{ filteredFiles.length }} of {{ totalFiles }} files
                <span v-if="searchQuery">matching "{{ searchQuery }}"</span>
                <span v-if="selectedModule">in {{ selectedModule }}</span>
            </p>

            <!-- Bulk Actions -->
            <div v-if="selectedFiles.length > 0" class="flex items-center space-x-2">
                <span class="text-sm text-gray-700">{{ selectedFiles.length }} selected</span>
                <button @click="handleBulkShare"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <ShareIcon class="w-3 h-3 mr-1" />
                    Share Selected
                </button>
                <button @click="handleBulkDownload"
                    class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <DocumentIcon class="w-3 h-3 mr-1" />
                    Download Selected
                </button>
            </div>
        </div>

        <!-- Files Grid/List -->
        <div v-if="filteredFiles.length > 0">
            <!-- Grid View -->
            <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="file in paginatedFiles" :key="file.id" class="relative">
                    <input v-model="selectedFiles" :value="file.id" type="checkbox"
                        class="absolute top-2 left-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <FileCard :file="file" :is-loading="downloadingFileId === file.id" @download="handleDownload"
                        @share="handleShare" @access-management="handleAccessManagement"
                        @more-options="handleMoreOptions" />
                </div>
            </div>

            <!-- List View -->
            <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
                <ul class="divide-y divide-gray-200">
                    <li v-for="file in paginatedFiles" :key="file.id" class="px-6 py-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <input v-model="selectedFiles" :value="file.id" type="checkbox"
                                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <DocumentIcon class="w-4 h-4 text-blue-600" />
                                    </div>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <p class="text-sm font-medium text-gray-900 truncate" :title="file.fileName">
                                        {{ file.fileName }}
                                    </p>
                                    <p class="text-sm text-gray-500 truncate">
                                        {{ formatDate(file.createdAt) }} • {{ formatFileSize(file.size) }}
                                    </p>
                                    <p class="text-xs text-gray-400 font-mono truncate mt-1" :title="file.id">
                                        ID: {{ file.id }}
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-center space-x-4 flex-shrink-0">
                                <span :class="getModuleBadgeClass(file.moduleName)"
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                                    {{ file.moduleName }}
                                </span>

                                <div class="flex items-center space-x-2">
                                    <button @click="copyFileId(file.id)" class="text-gray-400 hover:text-gray-600"
                                        title="Copy File ID">
                                        <ClipboardDocumentIcon v-if="copiedFileId !== file.id" class="w-4 h-4" />
                                        <CheckIcon v-else class="w-4 h-4 text-green-600" />
                                    </button>
                                    <button @click="handleDownload(file)" class="text-gray-400 hover:text-gray-600"
                                        title="Download" :disabled="downloadingFileId === file.id">
                                        <ArrowPathIcon v-if="downloadingFileId === file.id"
                                            class="w-4 h-4 animate-spin" />
                                        <DocumentIcon v-else class="w-4 h-4" />
                                    </button>
                                    <button @click="handleShare(file)" class="text-gray-400 hover:text-gray-600"
                                        title="Share">
                                        <ShareIcon class="w-4 h-4" />
                                    </button>
                                    <button @click="handleMoreOptions(file)" class="text-gray-400 hover:text-gray-600"
                                        title="More Options">
                                        <EllipsisVerticalIcon class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                        Previous
                    </button>
                    <button @click="currentPage = Math.min(totalPages, currentPage + 1)"
                        :disabled="currentPage === totalPages"
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                        Next
                    </button>
                </div>

                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Showing page <span class="font-medium">{{ currentPage }}</span> of <span
                                class="font-medium">{{ totalPages }}</span>
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                <ChevronLeftIcon class="h-5 w-5" />
                            </button>

                            <button v-for="page in visiblePages" :key="page" @click="currentPage = page"
                                :class="page === currentPage ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
                                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                {{ page }}
                            </button>

                            <button @click="currentPage = Math.min(totalPages, currentPage + 1)"
                                :disabled="currentPage === totalPages"
                                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                <ChevronRightIcon class="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
            <DocumentIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No files found</h3>
            <p class="mt-1 text-sm text-gray-500">
                <span v-if="searchQuery">Try adjusting your search terms.</span>
                <span v-else>Get started by uploading your first file.</span>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
    MagnifyingGlassIcon,
    Squares2X2Icon,
    ListBulletIcon,
    ShareIcon,
    DocumentIcon,
    EllipsisVerticalIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowPathIcon,
    ClipboardDocumentIcon,
    CheckIcon
} from '@heroicons/vue/24/outline';
import FileCard from './FileCard.vue';

// Props
const props = defineProps({
    files: {
        type: Array,
        default: () => []
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    downloadingFileId: {
        type: String,
        default: null
    }
});

// Emits
const emit = defineEmits(['download', 'share', 'access-management', 'more-options', 'bulk-share', 'bulk-download']);

// Reactive state
const searchQuery = ref('');
const selectedModule = ref('');
const sortBy = ref('date-desc');
const viewMode = ref('grid');
const selectedFiles = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(12);
const copiedFileId = ref(null);

// Computed
const totalFiles = computed(() => props.files.length);

const filteredFiles = computed(() => {
    let filtered = [...props.files];

    // Search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(file =>
            file.fileName.toLowerCase().includes(query) ||
            file.moduleName.toLowerCase().includes(query)
        );
    }

    // Module filter
    if (selectedModule.value) {
        filtered = filtered.filter(file => file.moduleName === selectedModule.value);
    }

    // Sort
    filtered.sort((a, b) => {
        switch (sortBy.value) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'name-asc':
                return a.fileName.localeCompare(b.fileName);
            case 'name-desc':
                return b.fileName.localeCompare(a.fileName);
            case 'size-desc':
                return (b.size || 0) - (a.size || 0);
            case 'size-asc':
                return (a.size || 0) - (b.size || 0);
            default:
                return 0;
        }
    });

    return filtered;
});

const totalPages = computed(() => Math.ceil(filteredFiles.value.length / itemsPerPage.value));

const paginatedFiles = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredFiles.value.slice(start, end);
});

const visiblePages = computed(() => {
    const pages = [];
    const start = Math.max(1, currentPage.value - 2);
    const end = Math.min(totalPages.value, currentPage.value + 2);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return pages;
});

// Methods
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const getModuleBadgeClass = (moduleName) => {
    const classes = {
        'MediVault': 'bg-green-100 text-green-800',
        'BioKey': 'bg-purple-100 text-purple-800',
        'IPSeal': 'bg-orange-100 text-orange-800'
    };
    return classes[moduleName] || 'bg-gray-100 text-gray-800';
};

const handleDownload = (file) => {
    emit('download', file);
};

const handleShare = (file) => {
    emit('share', file);
};

const handleAccessManagement = (file) => {
    emit('access-management', file);
};

const handleMoreOptions = (file) => {
    emit('more-options', file);
};

const handleBulkShare = () => {
    const files = props.files.filter(file => selectedFiles.value.includes(file.id));
    emit('bulk-share', files);
    selectedFiles.value = [];
};

const handleBulkDownload = () => {
    const files = props.files.filter(file => selectedFiles.value.includes(file.id));
    emit('bulk-download', files);
    selectedFiles.value = [];
};

const copyFileId = async (fileId) => {
    try {
        await navigator.clipboard.writeText(fileId);
        copiedFileId.value = fileId;
        setTimeout(() => {
            copiedFileId.value = null;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy file ID:', err);
    }
};

// Watchers
watch([searchQuery, selectedModule, sortBy], () => {
    currentPage.value = 1; // Reset to first page when filters change
});

watch(() => props.files, () => {
    selectedFiles.value = []; // Clear selection when files change
});
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
