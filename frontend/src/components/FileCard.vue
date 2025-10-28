<template>
    <div class="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        <!-- File Header -->
        <div class="p-4 border-b border-gray-100">
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center space-x-3 min-w-0 flex-1">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DocumentIcon class="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h3 class="text-sm font-medium text-gray-900 truncate" :title="file.fileName">
                            {{ file.fileName }}
                        </h3>
                        <p class="text-xs text-gray-500 truncate">
                            {{ formatDate(file.createdAt) }}
                        </p>
                    </div>
                </div>

                <!-- Module Badge -->
                <div class="flex-shrink-0">
                    <span :class="getModuleBadgeClass(file.moduleName)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                        {{ file.moduleName }}
                    </span>
                </div>
            </div>
        </div>

        <!-- File Details -->
        <div class="p-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-gray-500">Size:</span>
                    <span class="ml-1 text-gray-900">{{ formatFileSize(file.size) }}</span>
                </div>
                <div>
                    <span class="text-gray-500">Access Count:</span>
                    <span class="ml-1 text-gray-900">{{ file.accessCount }}</span>
                </div>
                <div>
                    <span class="text-gray-500">Type:</span>
                    <span class="ml-1 text-gray-900">{{ file.type }}</span>
                </div>
                <div>
                    <span class="text-gray-500">Status:</span>
                    <span :class="getStatusClass(file.isEncrypted)" class="ml-1 inline-flex items-center">
                        <ShieldCheckIcon v-if="file.isEncrypted" class="w-3 h-3 mr-1" />
                        <ShieldCheckIcon v-else class="w-3 h-3 mr-1" />
                        {{ file.isEncrypted ? 'Encrypted' : 'Unencrypted' }}
                    </span>
                </div>
            </div>

            <!-- Last Accessed -->
            <div v-if="file.lastAccessed" class="mt-3 text-xs text-gray-500">
                Last accessed: {{ formatDate(file.lastAccessed) }}
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
            <div class="flex items-center justify-between">
                <div class="flex space-x-2">
                    <button @click="handleDownload" :disabled="isLoading"
                        class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                        <ArrowPathIcon v-if="isLoading" class="w-3 h-3 mr-1 animate-spin" />
                        <DocumentIcon v-else class="w-3 h-3 mr-1" />
                        {{ isLoading ? 'Downloading...' : 'Download' }}
                    </button>

                    <button @click="handleShare" :disabled="isLoading"
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                        <ShareIcon class="w-3 h-3 mr-1" />
                        Share
                    </button>
                </div>

                <div class="flex space-x-1">
                    <button @click="handleAccessManagement" :disabled="isLoading"
                        class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
                        title="Manage Access">
                        <UsersIcon class="w-3 h-3" />
                    </button>

                    <button @click="handleMoreOptions" :disabled="isLoading"
                        class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
                        title="More Options">
                        <EllipsisVerticalIcon class="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading Overlay -->
        <div v-if="isLoading"
            class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div class="flex items-center space-x-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span class="text-sm text-gray-600">Processing...</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    DocumentIcon,
    ShareIcon,
    UsersIcon,
    EllipsisVerticalIcon,
    ShieldCheckIcon,
    ArrowPathIcon
} from '@heroicons/vue/24/outline';

// Props
const props = defineProps({
    file: {
        type: Object,
        required: true
    },
    isLoading: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['download', 'share', 'access-management', 'more-options']);

// Methods
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

const getStatusClass = (isEncrypted) => {
    return isEncrypted ? 'text-green-600' : 'text-red-600';
};

const handleDownload = async () => {
    // isLoading will be managed by the parent component
    emit('download', props.file);
};

const handleShare = () => {
    emit('share', props.file);
};

const handleAccessManagement = () => {
    emit('access-management', props.file);
};

const handleMoreOptions = () => {
    emit('more-options', props.file);
};
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
