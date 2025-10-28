<template>
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
                Access Management
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
                Manage who has access to "{{ file?.fileName }}"
            </p>
        </div>

        <div v-if="accessList.length > 0" class="divide-y divide-gray-200">
            <div v-for="access in accessList" :key="`${access.recipient}-${access.grantedAt}`"
                class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <UserIcon class="w-4 h-4 text-gray-600" />
                            </div>
                        </div>
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-gray-900 truncate">
                                {{ formatAddress(access.recipient) }}
                            </p>
                            <p class="text-sm text-gray-500">
                                Granted {{ formatDate(access.grantedAt) }}
                                <span v-if="access.expiry" class="ml-2">
                                    • Expires {{ formatDate(access.expiry) }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-4">
                        <!-- Access Level Badge -->
                        <span :class="getAccessLevelClass(access.accessLevel)"
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {{ getAccessLevelText(access.accessLevel) }}
                        </span>

                        <!-- Status Badge -->
                        <span :class="getStatusClass(access)"
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {{ getStatusText(access) }}
                        </span>

                        <!-- Actions -->
                        <div class="flex items-center space-x-2">
                            <button v-if="access.isActive" @click="handleExtendAccess(access)"
                                class="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                Extend
                            </button>
                            <button @click="handleRevokeAccess(access)" :disabled="isLoading"
                                class="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50">
                                Revoke
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Access History -->
                <div v-if="access.history && access.history.length > 0" class="mt-3 ml-12">
                    <details class="group">
                        <summary class="flex items-center text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            <ChevronRightIcon class="w-3 h-3 mr-1 group-open:rotate-90 transition-transform" />
                            Access History ({{ access.history.length }})
                        </summary>
                        <div class="mt-2 space-y-1">
                            <div v-for="event in access.history" :key="event.timestamp"
                                class="text-xs text-gray-500 pl-4">
                                <span class="font-medium">{{ event.action }}</span>
                                <span class="ml-2">{{ formatDate(event.timestamp) }}</span>
                                <span v-if="event.details" class="ml-2 text-gray-400">- {{ event.details }}</span>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="px-4 py-12 sm:px-6 text-center">
            <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No shared access</h3>
            <p class="mt-1 text-sm text-gray-500">
                This file hasn't been shared with anyone yet.
            </p>
            <div class="mt-6">
                <button @click="$emit('share-file')"
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <ShareIcon class="w-4 h-4 mr-2" />
                    Share File
                </button>
            </div>
        </div>

        <!-- Loading Overlay -->
        <div v-if="isLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div class="flex items-center space-x-2">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span class="text-sm text-gray-600">Processing...</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import {
    UserIcon,
    UserGroupIcon,
    ShareIcon,
    ChevronRightIcon
} from '@heroicons/vue/24/outline';

// Props
const props = defineProps({
    file: {
        type: Object,
        required: true
    },
    accessList: {
        type: Array,
        default: () => []
    },
    isLoading: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['revoke-access', 'extend-access', 'share-file']);

// Reactive state
const isLoading = ref(false);

// Methods
const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

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

const getAccessLevelClass = (level) => {
    const classes = {
        1: 'bg-blue-100 text-blue-800',
        2: 'bg-green-100 text-green-800',
        3: 'bg-purple-100 text-purple-800'
    };
    return classes[level] || 'bg-gray-100 text-gray-800';
};

const getAccessLevelText = (level) => {
    const texts = {
        1: 'Read Only',
        2: 'Read & Write',
        3: 'Full Access'
    };
    return texts[level] || 'Unknown';
};

const getStatusClass = (access) => {
    if (!access.isActive) return 'bg-red-100 text-red-800';
    if (access.expiry && new Date(access.expiry) < new Date()) {
        return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
};

const getStatusText = (access) => {
    if (!access.isActive) return 'Revoked';
    if (access.expiry && new Date(access.expiry) < new Date()) {
        return 'Expired';
    }
    if (access.expiry) {
        const daysLeft = Math.ceil((new Date(access.expiry) - new Date()) / (1000 * 60 * 60 * 24));
        return `${daysLeft} days left`;
    }
    return 'Active';
};

const handleRevokeAccess = async (access) => {
    isLoading.value = true;
    try {
        emit('revoke-access', {
            fileId: props.file.id,
            recipient: access.recipient
        });
    } finally {
        isLoading.value = false;
    }
};

const handleExtendAccess = (access) => {
    emit('extend-access', {
        fileId: props.file.id,
        recipient: access.recipient,
        currentExpiry: access.expiry
    });
};
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
