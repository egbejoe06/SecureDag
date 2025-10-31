<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <!-- Hero Section -->
        <div class="relative overflow-hidden">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div class="text-center">
                    <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        SecureDAG
                    </h1>
                    <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Decentralized, encrypted file storage on Hedera Hashgraph.
                        Your data, your keys, your control.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button @click="connectWallet" :disabled="isConnecting"
                            class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                            <WalletIcon class="w-5 h-5 mr-2" />
                            {{ isConnecting ? 'Connecting...' : 'Connect Wallet' }}
                        </button>
                        <button @click="scrollToFeatures"
                            class="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <InformationCircleIcon class="w-5 h-5 mr-2" />
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div id="features" class="py-20 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Why Choose SecureDAG?
                    </h2>
                    <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                        Built on Hedera Hashgraph for enterprise-grade security and performance
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Feature 1 -->
                    <div class="text-center">
                        <div
                            class="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                            <ShieldCheckIcon class="h-6 w-6" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">End-to-End Encryption</h3>
                        <p class="text-gray-600">
                            Your files are encrypted client-side using TweetNaCl before being stored on IPFS.
                            Only you have the keys.
                        </p>
                    </div>

                    <!-- Feature 2 -->
                    <div class="text-center">
                        <div
                            class="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
                            <BoltIcon class="h-6 w-6" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Lightning Fast</h3>
                        <p class="text-gray-600">
                            Hedera Hashgraph provides fast finality and low fees, making file operations
                            quick and cost-effective.
                        </p>
                    </div>

                    <!-- Feature 3 -->
                    <div class="text-center">
                        <div
                            class="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mb-4">
                            <GlobeAltIcon class="h-6 w-6" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Decentralized</h3>
                        <p class="text-gray-600">
                            No single point of failure. Your data is distributed across the IPFS network
                            and secured by Hedera's consensus.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modules Section -->
        <div class="py-20 bg-gray-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Specialized Modules
                    </h2>
                    <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                        Tailored solutions for different types of sensitive data
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- MediVault -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-center mb-4">
                            <div class="flex-shrink-0">
                                <div class="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <HeartIcon class="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-medium text-gray-900">MediVault</h3>
                                <p class="text-sm text-gray-500">Medical Records</p>
                            </div>
                        </div>
                        <p class="text-gray-600">
                            Secure storage for medical files with HIPAA-compliant encryption and
                            patient-controlled access.
                        </p>
                    </div>

                    <!-- BioKey -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-center mb-4">
                            <div class="flex-shrink-0">
                                <div class="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DnaIcon class="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-medium text-gray-900">BioKey</h3>
                                <p class="text-sm text-gray-500">Genomic Data</p>
                            </div>
                        </div>
                        <p class="text-gray-600">
                            Protect your genomic data with specialized encryption for DNA sequences
                            and genetic information.
                        </p>
                    </div>

                    <!-- IPSeal -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-center mb-4">
                            <div class="flex-shrink-0">
                                <div class="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <DocumentTextIcon class="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-medium text-gray-900">IPSeal</h3>
                                <p class="text-sm text-gray-500">Intellectual Property</p>
                            </div>
                        </div>
                        <p class="text-gray-600">
                            Safeguard patents, trademarks, and proprietary documents with
                            timestamped proof of ownership.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- CTA Section -->
        <div class="py-20 bg-blue-600">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Secure Your Data?
                </h2>
                <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    Join the decentralized future of data storage. Connect your wallet and start
                    protecting your files today.
                </p>
                <button @click="connectWallet" :disabled="isConnecting"
                    class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50">
                    <WalletIcon class="w-5 h-5 mr-2" />
                    {{ isConnecting ? 'Connecting...' : 'Get Started' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
    WalletIcon,
    InformationCircleIcon,
    ShieldCheckIcon,
    BoltIcon,
    GlobeAltIcon,
    HeartIcon,
    DocumentTextIcon
} from '@heroicons/vue/24/outline';
import { useWallet } from '../composable/useWallet';

// Custom DNA icon component (since it's not in Heroicons)
const DnaIcon = {
    template: `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    `
};

// Composables
const router = useRouter();
const { connectWallet: connectWalletHook } = useWallet();

// Reactive state
const isConnecting = ref(false);

// Methods
const connectWallet = async () => {
    isConnecting.value = true;
    try {
        await connectWalletHook();
        // Navigate to dashboard after successful connection
        router.push('/dashboard');
    } catch (error) {
        console.error('Failed to connect wallet:', error);
    } finally {
        isConnecting.value = false;
    }
};

const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({
        behavior: 'smooth'
    });
};
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
