import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * File Store - Manages file uploads, sharing, and access permissions
 */
export const useFileStore = defineStore("file", () => {
  // State
  const uploadedFiles = ref([]);
  const sharedFiles = ref([]);
  const filesSharedWithMe = ref([]);
  const fileAccessPermissions = ref(new Map());
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const totalUploadedFiles = computed(() => uploadedFiles.value.length);
  const totalSharedFiles = computed(() => sharedFiles.value.length);
  const totalFilesSharedWithMe = computed(() => filesSharedWithMe.value.length);

  const filesByModule = computed(() => {
    const grouped = {
      MediVault: [],
      BioKey: [],
      IPSeal: [],
    };

    uploadedFiles.value.forEach((file) => {
      const moduleName = getModuleName(file.module);
      if (grouped[moduleName]) {
        grouped[moduleName].push(file);
      }
    });

    return grouped;
  });

  const recentFiles = computed(() => {
    return [...uploadedFiles.value]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  });

  // Actions
  function addUploadedFile(fileData) {
    const file = {
      id: fileData.fileId,
      fileName: fileData.fileName,
      cid: fileData.cid,
      createdAt: fileData.createdAt,
      keyVersion: fileData.keyVersion,
      module: fileData.module,
      moduleName: getModuleName(fileData.module),
      owner: fileData.owner,
      size: fileData.size || 0,
      type: fileData.type || "unknown",
      isEncrypted: true,
      accessCount: 0,
      lastAccessed: null,
    };

    uploadedFiles.value.unshift(file);
  }

  function addSharedFile(fileData) {
    const sharedFile = {
      id: fileData.fileId,
      fileName: fileData.fileName,
      recipient: fileData.recipient,
      sharedAt: fileData.sharedAt || new Date().toISOString(),
      expiry: fileData.expiry,
      accessLevel: fileData.accessLevel || 1,
      isActive: fileData.isActive !== false,
    };

    sharedFiles.value.unshift(sharedFile);
  }

  function addFileSharedWithMe(fileData) {
    const file = {
      id: fileData.fileId,
      fileName: fileData.fileName,
      cid: fileData.cid,
      owner: fileData.owner,
      sharedAt: fileData.sharedAt || new Date().toISOString(),
      expiry: fileData.expiry,
      accessLevel: fileData.accessLevel || 1,
      module: fileData.module,
      moduleName: getModuleName(fileData.module),
      isActive: fileData.isActive !== false,
      canAccess: checkFileAccess(fileData.fileId, fileData.expiry),
      type: fileData.type || "unknown",
      size: fileData.size || 0,
    };

    filesSharedWithMe.value.unshift(file);
  }

  function updateFileAccess(fileId, recipient, accessData) {
    const key = `${fileId}_${recipient}`;
    fileAccessPermissions.value.set(key, {
      ...accessData,
      updatedAt: new Date().toISOString(),
    });
  }

  function revokeFileAccess(fileId, recipient) {
    const key = `${fileId}_${recipient}`;
    fileAccessPermissions.value.delete(key);

    // Update shared files list
    sharedFiles.value = sharedFiles.value.filter(
      (file) => !(file.id === fileId && file.recipient === recipient)
    );
  }

  function updateFileAccessCount(fileId) {
    const file = uploadedFiles.value.find((f) => f.id === fileId);
    if (file) {
      file.accessCount += 1;
      file.lastAccessed = new Date().toISOString();
    }
  }

  function setLoading(status) {
    isLoading.value = status;
  }

  function setError(errorMessage) {
    error.value = errorMessage;
  }

  function clearError() {
    error.value = null;
  }

  function getFileById(fileId) {
    return uploadedFiles.value.find((file) => file.id === fileId);
  }

  function getSharedFileById(fileId) {
    return sharedFiles.value.find((file) => file.id === fileId);
  }

  function getFileSharedWithMeById(fileId) {
    return filesSharedWithMe.value.find((file) => file.id === fileId);
  }

  function checkFileAccess(fileId, expiry) {
    if (!expiry) return true; // No expiry means permanent access

    const now = new Date().getTime();
    const expiryTime = new Date(expiry).getTime();

    return now < expiryTime;
  }

  function getFilesByModule(moduleType) {
    return uploadedFiles.value.filter((file) => file.module === moduleType);
  }

  function searchFiles(query) {
    const searchTerm = query.toLowerCase();
    return uploadedFiles.value.filter(
      (file) =>
        file.fileName.toLowerCase().includes(searchTerm) ||
        file.moduleName.toLowerCase().includes(searchTerm)
    );
  }

  function clearAllFiles() {
    uploadedFiles.value = [];
    sharedFiles.value = [];
    filesSharedWithMe.value = [];
    fileAccessPermissions.value.clear();
  }

  // Helper function to get module name from module type
  function getModuleName(moduleType) {
    const moduleNames = {
      1: "BioKey",
      2: "MediVault",
      3: "IPSeal",
    };
    return moduleNames[moduleType] || "Unknown";
  }

  return {
    // State
    uploadedFiles,
    sharedFiles,
    filesSharedWithMe,
    fileAccessPermissions,
    isLoading,
    error,

    // Getters
    totalUploadedFiles,
    totalSharedFiles,
    totalFilesSharedWithMe,
    filesByModule,
    recentFiles,

    // Actions
    addUploadedFile,
    addSharedFile,
    addFileSharedWithMe,
    updateFileAccess,
    revokeFileAccess,
    updateFileAccessCount,
    setLoading,
    setError,
    clearError,
    getFileById,
    getSharedFileById,
    getFileSharedWithMeById,
    checkFileAccess,
    getFilesByModule,
    searchFiles,
    clearAllFiles,
  };
});
