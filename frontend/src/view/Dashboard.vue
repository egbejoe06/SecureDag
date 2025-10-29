<template>
    <div class="p-6">
        <!-- Header -->
        <div class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p class="mt-1 text-sm text-gray-500">
                            Welcome back! Here's an overview of your SecureDAG files.
                        </p>
                    </div>

                    <!-- Module Selector -->
                    <div class="flex items-center space-x-4">
                        <label class="text-sm font-medium text-gray-700">Current Module:</label>
                        <select v-model="currentModule" @change="handleModuleChange"
                            class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="0">MediVault</option>
                            <option value="1">BioKey</option>
                            <option value="2">IPSeal</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <FolderIcon class="h-6 w-6 text-blue-600" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        Total Files
                                    </dt>
                                    <dd class="text-lg font-medium text-gray-900">
                                        {{ totalFiles }}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <ShareIcon class="h-6 w-6 text-green-600" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        Files Shared
                                    </dt>
                                    <dd class="text-lg font-medium text-gray-900">
                                        {{ totalSharedFiles }}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <InboxIcon class="h-6 w-6 text-purple-600" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        Files Shared With Me
                                    </dt>
                                    <dd class="text-lg font-medium text-gray-900">
                                        {{ totalFilesSharedWithMe }}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <ShieldCheckIcon class="h-6 w-6 text-orange-600" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        Encryption Status
                                    </dt>
                                    <dd class="text-lg font-medium text-gray-900">
                                        {{ hasUserKeyPair ? 'Active' : 'Not Set' }}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white shadow rounded-lg mb-8">
                <div class="px-4 py-5 sm:p-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Quick Actions
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button @click="navigateToMyFiles"
                            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <PlusIcon class="w-4 h-4 mr-2" />
                            Upload File
                        </button>

                        <button @click="navigateToShared"
                            class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <InboxIcon class="w-4 h-4 mr-2" />
                            View Shared Files
                        </button>

                        <button v-if="!hasUserKeyPair" @click="setupEncryption"
                            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                            <KeyIcon class="w-4 h-4 mr-2" />
                            Setup Encryption
                        </button>

                        <button @click="navigateToSettings"
                            class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <CogIcon class="w-4 h-4 mr-2" />
                            Settings
                        </button>
                    </div>
                </div>
            </div>

            <!-- Recent Files -->
            <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            Recent Files
                        </h3>
                        <button @click="navigateToMyFiles"
                            class="text-sm text-blue-600 hover:text-blue-500 font-medium">
                            View All
                        </button>
                    </div>

                    <div v-if="recentFiles.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="file in recentFiles.slice(0, 6)" :key="file.id"
                            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div class="flex items-center space-x-3">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <DocumentIcon class="w-4 h-4 text-blue-600" />
                                    </div>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <p class="text-sm font-medium text-gray-900 truncate">
                                        {{ file.fileName }}
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        {{ formatDate(file.createdAt) }}
                                    </p>
                                </div>
                                <div class="flex-shrink-0">
                                    <span :class="getModuleBadgeClass(file.moduleName)"
                                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
                                        {{ file.moduleName }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="text-center py-8">
                        <DocumentIcon class="mx-auto h-12 w-12 text-gray-400" />
                        <h3 class="mt-2 text-sm font-medium text-gray-900">No files yet</h3>
                        <p class="mt-1 text-sm text-gray-500">
                            Get started by uploading your first file.
                        </p>
                        <div class="mt-6">
                            <button @click="navigateToMyFiles"
                                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <PlusIcon class="w-4 h-4 mr-2" />
                                Upload File
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    FolderIcon,
    ShareIcon,
    InboxIcon,
    ShieldCheckIcon,
    PlusIcon,
    KeyIcon,
    CogIcon,
    DocumentIcon
} from '@heroicons/vue/24/outline';
import { useWallet } from '../composable/useWallet';
import { useFileStore } from '../stores/file';
import { useKeyStore } from '../stores/key';
import { useModuleStore } from '../stores/module';

// Composables
const router = useRouter();
const { deriveAndRegisterKeys } = useWallet();
const fileStore = useFileStore();
const keyStore = useKeyStore();
const moduleStore = useModuleStore();

// Reactive state
const currentModule = ref('0'); // Default to MediVault

// Computed
const totalFiles = computed(() => fileStore.totalUploadedFiles);
const totalSharedFiles = computed(() => fileStore.totalSharedFiles);
const totalFilesSharedWithMe = computed(() => fileStore.totalFilesSharedWithMe);
const hasUserKeyPair = computed(() => keyStore.hasUserKeyPair);
const recentFiles = computed(() => fileStore.recentFiles);

// Methods
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getModuleBadgeClass = (moduleName) => {
    const classes = {
        'MediVault': 'bg-green-100 text-green-800',
        'BioKey': 'bg-purple-100 text-purple-800',
        'IPSeal': 'bg-orange-100 text-orange-800'
    };
    return classes[moduleName] || 'bg-gray-100 text-gray-800';
};

const handleModuleChange = () => {
    moduleStore.switchToModule(parseInt(currentModule.value));
};

const navigateToMyFiles = () => {
    router.push('/my-files');
};

const navigateToShared = () => {
    router.push('/shared');
};

const navigateToSettings = () => {
    router.push('/settings');
};

const setupEncryption = async () => {
    try {
        await deriveAndRegisterKeys();
        // Show success message or redirect
    } catch (error) {
        console.error('Failed to setup encryption:', error);
        // Show error message
    }
};

// Lifecycle
onMounted(() => {
    // Set initial module
    moduleStore.setCurrentModule(parseInt(currentModule.value));
});
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
