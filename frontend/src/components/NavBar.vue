<template>
    <nav class="bg-white shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <!-- Logo and brand -->
                <div class="flex items-center">
                    <router-link to="/" class="flex-shrink-0 flex items-center">
                        <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <ShieldCheckIcon class="h-5 w-5 text-white" />
                        </div>
                        <span class="text-xl font-bold text-gray-900">SecureDAG</span>
                    </router-link>
                </div>

                <!-- Navigation links -->
                <div class="hidden md:flex items-center space-x-8">
                    <router-link to="/dashboard"
                        class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        :class="{ 'text-blue-600 bg-blue-50': $route.name === 'Dashboard' }">
                        Dashboard
                    </router-link>
                    <router-link to="/my-files"
                        class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        :class="{ 'text-blue-600 bg-blue-50': $route.name === 'MyFiles' }">
                        My Files
                    </router-link>
                    <router-link to="/shared"
                        class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        :class="{ 'text-blue-600 bg-blue-50': $route.name === 'SharedWithMe' }">
                        Shared With Me
                    </router-link>
                    <router-link to="/settings"
                        class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        :class="{ 'text-blue-600 bg-blue-50': $route.name === 'Settings' }">
                        Settings
                    </router-link>
                </div>

                <!-- Wallet connection and user menu -->
                <div class="flex items-center space-x-4">
                    <!-- Wallet connection button -->
                    <button v-if="!isConnected" @click="handleConnectWallet"
                        :disabled="isConnecting || walletStore.isLoading"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
                        <WalletIcon class="w-4 h-4 mr-2" :class="{ 'animate-pulse': walletStore.isLoading }" />
                        {{ connectButtonText }}
                    </button>

                    <!-- Connected wallet info -->
                    <div v-else class="flex items-center space-x-3">
                        <div class="text-sm text-gray-700">
                            <div class="font-medium">{{ truncatedAddress }}</div>
                            <div class="text-xs text-gray-500">{{ networkName }}</div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button @click="handleReconnect" :disabled="isReconnecting"
                                class="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                                title="Reconnect Wallet">
                                <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': isReconnecting }" />
                            </button>
                            <button @click="disconnectWallet"
                                class="text-gray-400 hover:text-gray-600 transition-colors" title="Disconnect Wallet">
                                <ArrowRightOnRectangleIcon class="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <!-- Mobile menu button -->
                    <button @click="toggleMobileMenu"
                        class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                        <Bars3Icon v-if="!mobileMenuOpen" class="block h-6 w-6" />
                        <XMarkIcon v-else class="block h-6 w-6" />
                    </button>
                </div>
            </div>

            <!-- Mobile menu -->
            <div v-if="mobileMenuOpen" class="md:hidden">
                <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                    <router-link to="/dashboard" @click="closeMobileMenu"
                        class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                        :class="{ 'text-blue-600 bg-blue-50': $route.name === 'Dashboard' }">
                        Dashboard
                    </router-link>
                    <router-link to="/my-files" @click="closeMobileMenu"
                        class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                        :class="{ 'text-blue-600 bg-blue-50': $route.name === 'MyFiles' }">
                        My Files
                    </router-link>
                    <router-link to="/shared" @click="closeMobileMenu"
                        class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                        :class="{ 'text-blue-600 bg-blue-50': $route.name === 'SharedWithMe' }">
                        Shared With Me
                    </router-link>
                    <router-link to="/settings" @click="closeMobileMenu"
                        class="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                        :class="{ 'text-blue-600 bg-blue-50': $route.name === 'Settings' }">
                        Settings
                    </router-link>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useWallet } from '../composable/useWallet';
import {
    ShieldCheckIcon,
    WalletIcon,
    ArrowRightOnRectangleIcon,
    ArrowPathIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/vue/24/outline';

// Wallet composable
const { connected: isConnected, connectWallet, manualReconnect, userAccount: walletAddress, walletStore } = useWallet();

// Additional reactive state
const isConnecting = ref(false);
const isReconnecting = ref(false);
const mobileMenuOpen = ref(false);

// Computed properties
const networkName = computed(() => walletStore.networkName || 'Hedera Testnet');
const truncatedAddress = computed(() => {
    if (!walletAddress.value) return '';
    return `${walletAddress.value.slice(0, 6)}...${walletAddress.value.slice(-4)}`;
});
const connectButtonText = computed(() => {
    if (walletStore.isLoading) return 'Reconnecting...';
    if (isConnecting.value) return 'Connecting...';
    return 'Connect Wallet';
});

// Methods
const handleConnectWallet = async () => {
    isConnecting.value = true;
    try {
        await connectWallet();
    } catch (error) {
        console.error('Failed to connect wallet:', error);
    } finally {
        isConnecting.value = false;
    }
};

const handleReconnect = async () => {
    isReconnecting.value = true;
    try {
        await manualReconnect();
    } catch (error) {
        console.error('Failed to reconnect wallet:', error);
    } finally {
        isReconnecting.value = false;
    }
};

const disconnectWallet = () => {
    walletStore.resetWallet();
    // Reset connection state
    isConnected.value = false;
    walletAddress.value = '';
};

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
    mobileMenuOpen.value = false;
};
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style>
