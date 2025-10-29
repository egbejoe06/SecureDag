<template>
    <div class="p-6">
        <!-- Header -->
        <div class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="py-6">
                    <h1 class="text-2xl font-bold text-gray-900">IP Verification</h1>
                    <p class="mt-1 text-sm text-gray-500">
                        Verify intellectual property documents and timestamps
                    </p>
                </div>
            </div>
        </div>

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Verification Card -->
            <div class="bg-white shadow rounded-lg mb-6">
                <div class="px-4 py-5 sm:p-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Verify Document
                    </h3>

                    <div class="space-y-4">
                        <div>
                            <label for="document-file" class="block text-sm font-medium text-gray-700">
                                Select Document to Verify
                            </label>
                            <input type="file" id="document-file" ref="fileInput" @change="handleFileSelect"
                                class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="*/*" />
                        </div>

                        <!-- IPSeal Files List -->
                        <div v-if="ipSealFiles.length > 0">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Select IPSeal File ID
                            </label>
                            <div class="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                                <div v-for="file in ipSealFiles" :key="file.id"
                                    class="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                                    <div class="flex-1 min-w-0 mr-2">
                                        <p class="text-sm font-medium text-gray-900 truncate">{{ file.fileName }}</p>
                                        <p class="text-xs text-gray-500 font-mono truncate">{{ file.id }}</p>
                                    </div>
                                    <button @click="useFileId(file.id)"
                                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        Use
                                    </button>
                                    <button @click="copyToClipboard(file.id)"
                                        class="ml-2 inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        <ClipboardDocumentIcon class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- File ID Input -->
                        <div v-if="selectedFile">
                            <label for="file-id" class="block text-sm font-medium text-gray-700">
                                File ID (from blockchain)
                            </label>
                            <div class="mt-1 flex rounded-md shadow-sm">
                                <input type="text" id="file-id" v-model="fileId"
                                    class="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Enter or select file ID to verify against" />
                                <button @click="copyToClipboard(fileId)" :disabled="!fileId"
                                    class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                    <ClipboardDocumentIcon class="w-4 h-4" />
                                </button>
                            </div>
                            <p v-if="copied" class="mt-1 text-xs text-green-600">✓ Copied to clipboard!</p>
                        </div>

                        <div class="flex space-x-4">
                            <button @click="verifyDocument" :disabled="!selectedFile || isLoading || !fileId"
                                class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                <span v-if="isLoading"
                                    class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                                <span v-else class="mr-2">🔍</span>
                                Verify
                            </button>
                            <button @click="downloadCertificate" :disabled="!verificationResult || !selectedFile"
                                class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                <span class="mr-2">📄</span>
                                Download Certificate
                            </button>
                        </div>
                    </div>

                    <!-- Verification Result -->
                    <div v-if="verificationResult" class="mt-6">
                        <div :class="verificationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'"
                            class="border rounded-md p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <CheckCircleIcon v-if="verificationResult.isValid" class="h-5 w-5 text-green-400" />
                                    <XCircleIcon v-else class="h-5 w-5 text-red-400" />
                                </div>
                                <div class="ml-3">
                                    <h3 :class="verificationResult.isValid ? 'text-green-800' : 'text-red-800'"
                                        class="text-sm font-medium">
                                        {{ verificationResult.isValid ? 'Verified' : 'Verification Failed' }}
                                    </h3>
                                    <div class="mt-2 text-sm"
                                        :class="verificationResult.isValid ? 'text-green-700' : 'text-red-700'">
                                        <p>{{ verificationResult.message }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- IP Details -->
                        <div v-if="verificationResult.ipData"
                            class="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
                            <h4 class="text-sm font-medium text-gray-900 mb-2">IP Details</h4>
                            <dl class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <dt class="text-gray-500">Type:</dt>
                                    <dd class="text-gray-900">{{ verificationResult.ipData.ipType }}</dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-gray-500">Description:</dt>
                                    <dd class="text-gray-900">{{ verificationResult.ipData.description }}</dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-gray-500">Timestamp:</dt>
                                    <dd class="text-gray-900">{{ formatDate(verificationResult.ipData.timestamp) }}</dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-gray-500">Document Hash:</dt>
                                    <dd class="text-gray-900 font-mono text-xs break-all">{{
                                        verificationResult.ipData.documentHash }}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Success Modal -->
            <SuccessModal :is-open="showSuccessModal" :title="successTitle" :message="successMessage"
                :type="successModalType" @close="closeSuccessModal" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClipboardDocumentIcon
} from '@heroicons/vue/24/outline';
import { useWallet } from '../composable/useWallet';
import { useFileStore } from '../stores/file';
import { generateDocumentHash } from '../utils/crypto';
import SuccessModal from '../components/SuccessModal.vue';

const { verifyDocumentIntegrity, getIPTimestamp, hasIPTimestamp } = useWallet();
const fileStore = useFileStore();

const selectedFile = ref(null);
const fileId = ref('');
const isLoading = ref(false);
const verificationResult = ref(null);
const showSuccessModal = ref(false);
const successTitle = ref('');
const successMessage = ref('');
const successModalType = ref('success');
const copied = ref(false);

// Get IPSeal files from the store
const ipSealFiles = computed(() => {
    return fileStore.uploadedFiles.filter(file => file.module === 2); // IPSeal is module 2
});

const handleFileSelect = (event) => {
    selectedFile.value = event.target.files[0];
    verificationResult.value = null;
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
};

const useFileId = (id) => {
    fileId.value = id;
};

const verifyDocument = async () => {
    if (!selectedFile.value || !fileId.value) {
        return;
    }

    try {
        isLoading.value = true;

        // First check if the file has an IP timestamp
        const fileHasTimestamp = await hasIPTimestamp(fileId.value);
        if (!fileHasTimestamp) {
            throw new Error('This file does not have an IP timestamp. It may not have been uploaded to the IPSeal module with proper IP information.');
        }

        // Calculate hash of selected file
        const fileData = new Uint8Array(await selectedFile.value.arrayBuffer());
        const documentHash = generateDocumentHash(fileData);

        // Get document hash from blockchain and IP details
        const ipData = await getIPTimestamp(fileId.value);

        // Verify integrity
        const isValid = await verifyDocumentIntegrity(fileId.value, documentHash);

        verificationResult.value = {
            isValid,
            message: isValid
                ? 'Document hash matches the timestamped version. This document is authentic.'
                : 'Document hash does not match the timestamped version. This document may have been modified.',
            ipData: ipData
        };

        if (isValid) {
            successTitle.value = 'Verification Successful';
            successMessage.value = 'The document is authentic and matches the blockchain record.';
            successModalType.value = 'success';
        } else {
            successTitle.value = 'Verification Failed';
            successMessage.value = 'The document hash does not match the blockchain record.';
            successModalType.value = 'error';
        }
        showSuccessModal.value = true;
    } catch (error) {
        console.error('Verification failed:', error);
        verificationResult.value = {
            isValid: false,
            message: error.message || 'Verification failed. Please ensure the file ID is correct and the file was uploaded to the IPSeal module.',
            ipData: null
        };
        successTitle.value = 'Verification Failed';
        successMessage.value = error.message || 'Verification failed. Please ensure the file ID is correct and the file was uploaded to the IPSeal module.';
        successModalType.value = 'error';
        showSuccessModal.value = true;
    } finally {
        isLoading.value = false;
    }
};

const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
};

const downloadCertificate = () => {
    if (!verificationResult.value || !selectedFile.value) {
        return;
    }

    const ipData = verificationResult.value.ipData;

    // Generate certificate HTML
    const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>IP Verification Certificate</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                .certificate { border: 3px solid #000; padding: 40px; max-width: 800px; margin: 0 auto; }
                h1 { text-align: center; }
                .details { margin-top: 30px; }
                .details div { margin: 10px 0; }
                .hash { font-family: monospace; word-break: break-all; }
            </style>
        </head>
        <body>
            <div class="certificate">
                <h1>IP Verification Certificate</h1>
                <div class="details">
                    <div><strong>Document:</strong> ${selectedFile.value.name}</div>
                    <div><strong>IP Type:</strong> ${ipData.ipType}</div>
                    <div><strong>Description:</strong> ${ipData.description}</div>
                    <div><strong>Timestamp:</strong> ${formatDate(ipData.timestamp)}</div>
                    <div><strong>File ID:</strong> ${fileId.value}</div>
                    <div><strong>Document Hash:</strong> <span class="hash">${ipData.documentHash}</span></div>
                    <div style="margin-top: 30px;">
                        <strong>Status:</strong> ${verificationResult.value.isValid ? 'VERIFIED - AUTHENTIC' : 'FAILED - MODIFIED'}
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    // Download as HTML
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ip-verification-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const closeSuccessModal = () => {
    showSuccessModal.value = false;
};
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
