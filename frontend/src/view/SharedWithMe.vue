<template>
    <div class="p-6">
        <!-- Header -->
        <div class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Shared With Me</h1>
                        <p class="mt-1 text-sm text-gray-500">
                            Files that have been shared with you
                        </p>
                    </div>

                    <!-- Refresh Button -->
                    <button @click="refreshFiles" :disabled="isLoading"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                        <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': isLoading }" />
                        Refresh
                    </button>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <InboxIcon class="h-6 w-6 text-blue-600" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        Total Shared Files
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
                                <ClockIcon class="h-6 w-6 text-orange-600" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        Expiring Soon
                                    </dt>
                                    <dd class="text-lg font-medium text-gray-900">
                                        {{ expiringSoonCount }}
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
                                <ShieldCheckIcon class="h-6 w-6 text-green-600" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        Active Access
                                    </dt>
                                    <dd class="text-lg font-medium text-gray-900">
                                        {{ activeAccessCount }}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="bg-white shadow rounded-lg mb-6">
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                            :class="activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            {{ tab.name }}
                            <span v-if="tab.count !== undefined"
                                class="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                                {{ tab.count }}
                            </span>
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Files Grid -->
            <div v-if="filteredFiles.length > 0">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div v-for="file in filteredFiles" :key="file.id"
                        class="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                        <!-- File Header -->
                        <div class="p-4 border-b border-gray-100">
                            <div class="flex items-center justify-between gap-3">
                                <div class="flex items-center space-x-3 min-w-0 flex-1">
                                    <div class="flex-shrink-0">
                                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <DocumentIcon class="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div class="min-w-0 flex-1 overflow-hidden">
                                        <h3 class="text-sm font-medium text-gray-900 truncate">
                                            {{ file.fileName }}
                                        </h3>
                                        <p class="text-xs text-gray-500 truncate">
                                            Shared by {{ formatAddress(file.owner) }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Module Badge -->
                                <div class="flex-shrink-0 ml-2">
                                    <span :class="getModuleBadgeClass(file.moduleName)"
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                                        {{ file.moduleName }}
                                    </span>
                                </div>
                            </div>

                            <!-- File ID Row -->
                            <div
                                class="mt-3 mx-4 flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-gray-500 truncate" :title="file.id">
                                        <span class="font-medium">ID:</span> {{ file.id }}
                                    </p>
                                </div>
                                <button @click="copyFileId(file.id)"
                                    class="flex-shrink-0 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    title="Copy File ID">
                                    <ClipboardDocumentIcon v-if="copiedFileId !== file.id" class="w-3 h-3" />
                                    <CheckIcon v-else class="w-3 h-3 text-green-600" />
                                </button>
                            </div>
                        </div>

                        <!-- File Details -->
                        <div class="p-4">
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Shared:</span>
                                    <span class="text-gray-900">{{ formatDate(file.sharedAt) }}</span>
                                </div>
                                <div v-if="file.expiry" class="flex justify-between">
                                    <span class="text-gray-500">Expires:</span>
                                    <span :class="getExpiryClass(file.expiry)" class="text-sm font-medium">
                                        {{ formatDate(file.expiry) }}
                                    </span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Access:</span>
                                    <span :class="getAccessLevelClass(file.accessLevel)"
                                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
                                        {{ getAccessLevelText(file.accessLevel) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                            <div class="flex items-center justify-between">
                                <div class="flex space-x-2">
                                    <button @click="handleDownload(file)" :disabled="!file.canAccess || isLoading"
                                        class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                        <ArrowPathIcon v-if="downloadingFileId === file.id"
                                            class="w-3 h-3 mr-1 animate-spin" />
                                        <DocumentIcon v-else class="w-3 h-3 mr-1" />
                                        {{ downloadingFileId === file.id ? 'Downloading...' : 'Download' }}
                                    </button>

                                    <button v-if="file.moduleName === 'MediVault'" @click="handleEmergencyAccess(file)"
                                        :disabled="!file.canAccess || isLoading"
                                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                                        <ExclamationTriangleIcon class="w-3 h-3 mr-1" />
                                        Emergency
                                    </button>
                                </div>

                                <div class="flex space-x-1">
                                    <button @click="handleViewDetails(file)" :disabled="isLoading"
                                        class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
                                        title="View Details">
                                        <EyeIcon class="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Expiry Warning -->
                        <div v-if="file.expiry && isExpiringSoon(file.expiry)"
                            class="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
                            <div class="flex items-center">
                                <ExclamationTriangleIcon class="w-4 h-4 text-yellow-400 mr-2" />
                                <span class="text-xs text-yellow-800">
                                    Access expires in {{ getDaysUntilExpiry(file.expiry) }} days
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12">
                <InboxIcon class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">No shared files</h3>
                <p class="mt-1 text-sm text-gray-500">
                    <span v-if="activeTab === 'all'">No files have been shared with you yet.</span>
                    <span v-else-if="activeTab === 'active'">No active shared files.</span>
                    <span v-else-if="activeTab === 'expired'">No expired shared files.</span>
                    <span v-else-if="activeTab === 'expiring'">No files expiring soon.</span>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
    InboxIcon,
    ArrowPathIcon,
    ClockIcon,
    ShieldCheckIcon,
    DocumentIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    ClipboardDocumentIcon,
    CheckIcon
} from '@heroicons/vue/24/outline';
import { useFileStore } from '../stores/file';
import { useWallet } from '../composable/useWallet';
import { useKeyStore } from '../stores/key';
import { decryptFile, decryptFileKey, downloadFile, hexToUint8Array, encryptFileKey } from '../utils/crypto';
import { downloadFromIPFS } from '../utils/ipfs';

// Composables
const fileStore = useFileStore();
const { getDataVaultContract, userAccount, loadSharedFiles, grantEmergencyAccess, checkIfProvider, getPublicKey } = useWallet();
const keyStore = useKeyStore();

// Reactive state
const isLoading = ref(false);
const activeTab = ref('all');
const downloadingFileId = ref(null);
const copiedFileId = ref(null);

// Computed
const totalSharedFiles = computed(() => fileStore.totalFilesSharedWithMe);
const filesSharedWithMe = computed(() => fileStore.filesSharedWithMe);

const activeFiles = computed(() =>
    filesSharedWithMe.value.filter(file => file.isActive && file.canAccess)
);

const expiredFiles = computed(() =>
    filesSharedWithMe.value.filter(file => !file.canAccess)
);

const expiringSoonFiles = computed(() =>
    filesSharedWithMe.value.filter(file =>
        file.expiry && isExpiringSoon(file.expiry) && file.canAccess
    )
);

const expiringSoonCount = computed(() => expiringSoonFiles.value.length);
const activeAccessCount = computed(() => activeFiles.value.length);

const tabs = computed(() => [
    { id: 'all', name: 'All Files', count: totalSharedFiles.value },
    { id: 'active', name: 'Active', count: activeFiles.value.length },
    { id: 'expired', name: 'Expired', count: expiredFiles.value.length },
    { id: 'expiring', name: 'Expiring Soon', count: expiringSoonCount.value }
]);

const filteredFiles = computed(() => {
    switch (activeTab.value) {
        case 'active':
            return activeFiles.value;
        case 'expired':
            return expiredFiles.value;
        case 'expiring':
            return expiringSoonFiles.value;
        default:
            return filesSharedWithMe.value;
    }
});

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

const getExpiryClass = (expiry) => {
    if (!expiry) return 'text-gray-900';

    const daysLeft = getDaysUntilExpiry(expiry);
    if (daysLeft <= 0) return 'text-red-600';
    if (daysLeft <= 7) return 'text-yellow-600';
    return 'text-gray-900';
};

const getDaysUntilExpiry = (expiry) => {
    const now = new Date();
    const expiryDate = new Date(expiry);
    const diffTime = expiryDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isExpiringSoon = (expiry) => {
    return getDaysUntilExpiry(expiry) <= 7 && getDaysUntilExpiry(expiry) > 0;
};

const refreshFiles = async () => {
    isLoading.value = true;
    try {
        if (userAccount.value) {
            console.log('Loading shared files for user:', userAccount.value);
            const sharedFiles = await loadSharedFiles();

            // Clear existing shared files and add loaded files to store
            fileStore.filesSharedWithMe = [];
            sharedFiles.forEach(file => {
                fileStore.addFileSharedWithMe({
                    fileId: file.id,
                    fileName: file.fileName,
                    cid: file.cid,
                    owner: file.owner,
                    sharedAt: file.sharedAt,
                    expiry: file.expiry,
                    accessLevel: file.accessLevel,
                    module: file.module,
                    isActive: file.isActive,
                    type: file.type,
                    size: file.size
                });
            });

            console.log(`Loaded ${sharedFiles.length} shared files`);
        } else {
            console.log('No user account connected, skipping shared files load');
        }
    } catch (error) {
        console.error('Failed to load shared files:', error);
    } finally {
        isLoading.value = false;
    }
};

const handleDownload = async (file) => {
    if (!file.canAccess) {
        alert('Access to this file has expired');
        return;
    }

    if (!file) {
        console.error('No file provided for download');
        return;
    }

    try {
        // Check if wallet is connected
        if (!userAccount.value) {
            alert('Please connect your wallet first to download files.');
            return;
        }

        // Check if user has derived encryption keys
        if (!keyStore.hasUserKeyPair) {
            alert('Please derive encryption keys first. Go to Settings to generate your encryption keys.');
            return;
        }

        // Show loading state for this specific file
        downloadingFileId.value = file.id;
        isLoading.value = true;

        // Get DataVault contract
        const dataVaultContract = getDataVaultContract();
        if (!dataVaultContract) {
            throw new Error('Wallet not connected or DataVault contract not available. Please connect your wallet first.');
        }

        // Get file details from blockchain
        const fileDetails = await dataVaultContract.getFileInfo(file.id);
        if (!fileDetails) {
            throw new Error('File not found on blockchain');
        }

        // Get encrypted file key from blockchain for shared access
        const encryptedFileKey = await dataVaultContract.getEncryptedFileKey(file.id, userAccount.value);
        if (!encryptedFileKey || encryptedFileKey.length === 0) {
            throw new Error('File key not found or access denied');
        }

        // Convert encrypted file key to Uint8Array if needed
        let encryptedFileKeyBytes;
        if (encryptedFileKey instanceof Uint8Array) {
            encryptedFileKeyBytes = encryptedFileKey;
        } else if (typeof encryptedFileKey === 'string') {
            // If it's a hex string, convert it
            encryptedFileKeyBytes = hexToUint8Array(encryptedFileKey);
        } else if (Array.isArray(encryptedFileKey)) {
            // If it's a regular array, convert to Uint8Array
            encryptedFileKeyBytes = new Uint8Array(encryptedFileKey);
        } else {
            throw new Error(`Unsupported encrypted file key format: ${typeof encryptedFileKey}`);
        }

        // Get user's private key for decryption
        const userKeyPair = keyStore.userKeyPair;
        if (!userKeyPair) {
            throw new Error('User encryption keys not available');
        }

        // Decrypt the file key
        const fileKey = decryptFileKey(encryptedFileKeyBytes, userKeyPair.x25519.secretKey);

        // Download encrypted file from IPFS
        const encryptedFileData = await downloadFromIPFS(file.cid);

        // Decrypt the file
        const decryptedFileData = decryptFile(encryptedFileData, fileKey);

        // Trigger browser download
        downloadFile(decryptedFileData, file.fileName, file.type);

        console.log('File downloaded successfully:', file.fileName);

    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed: ' + error.message);
    } finally {
        isLoading.value = false;
        downloadingFileId.value = null;
    }
};

const handleEmergencyAccess = async (file) => {
    if (!file || file.moduleName !== 'MediVault') {
        alert('Emergency access is only available for medical files (MediVault).');
        return;
    }

    try {
        // Check if wallet is connected
        if (!userAccount.value) {
            alert('Please connect your wallet first.');
            return;
        }

        // Check if user has derived encryption keys
        if (!keyStore.hasUserKeyPair) {
            alert('Please derive encryption keys first. Go to Settings to generate your encryption keys.');
            return;
        }

        // Confirm emergency access
        const confirmed = window.confirm(
            'Emergency access will grant you 48-hour access to this medical file. Are you sure you want to proceed?'
        );
        if (!confirmed) return;

        // Check if user is a registered provider
        const isProvider = await checkIfProvider();
        if (!isProvider) {
            alert('You must be a registered healthcare provider to use emergency access. Please register at the Provider Registry.');
            return;
        }

        isLoading.value = true;

        // Get provider's public key for encryption
        const providerPublicKey = await getPublicKey(userAccount.value);
        if (!providerPublicKey) {
            throw new Error('Failed to get provider public key');
        }

        // Get file key from DataVault
        const dataVaultContract = getDataVaultContract();
        const encryptedFileKey = await dataVaultContract.getEncryptedFileKey(file.id, userAccount.value);

        if (!encryptedFileKey || encryptedFileKey.length === 0) {
            // Need to get owner's file key and re-encrypt it
            const fileInfo = await dataVaultContract.getFileInfo(file.id);

            // Get encrypted key for owner (we can access our own encrypted key)
            // Actually, this won't work as expected - emergency access should be granted by the module
            // with the encrypted key already prepared
            throw new Error('Cannot prepare encrypted key for emergency access. This feature requires the file owner to pre-authorize providers.');
        }

        // Convert and decrypt file key if we have it
        let encryptedFileKeyBytes;
        if (encryptedFileKey instanceof Uint8Array) {
            encryptedFileKeyBytes = encryptedFileKey;
        } else if (typeof encryptedFileKey === 'string') {
            encryptedFileKeyBytes = hexToUint8Array(encryptedFileKey);
        } else if (Array.isArray(encryptedFileKey)) {
            encryptedFileKeyBytes = new Uint8Array(encryptedFileKey);
        } else {
            throw new Error('Unsupported encrypted file key format');
        }

        // Decrypt file key
        const userKeyPair = keyStore.userKeyPair;
        const fileKey = decryptFileKey(encryptedFileKeyBytes, userKeyPair.x25519.secretKey);

        // Re-encrypt for provider (ourselves in this case, since we're the provider)
        const encryptedProviderKey = encryptFileKey(
            fileKey,
            providerPublicKey,
            userKeyPair.x25519.secretKey
        );

        // Grant emergency access through MediVault module
        await grantEmergencyAccess(file.id, encryptedProviderKey);

        // Show success
        alert('Emergency access granted. You now have 48-hour access to this file.');

        // Refresh the page or file list
        location.reload();
    } catch (error) {
        console.error('Emergency access failed:', error);
        alert('Failed to grant emergency access: ' + error.message);
    } finally {
        isLoading.value = false;
    }
};

const handleViewDetails = (file) => {
    // TODO: Show file details modal
    console.log('View details for file:', file);
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

// Lifecycle
onMounted(() => {
    refreshFiles();
});
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
