import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * Module Store - Manages current module context and module-specific settings
 */
export const useModuleStore = defineStore("module", () => {
  // State
  const currentModule = ref(0);
  const moduleSettings = ref({
    MediVault: {
      emergencyAccessEnabled: true,
      defaultExpiryDays: 30,
      requireProviderVerification: true,
      auditLogEnabled: true,
    },
    BioKey: {
      simplifiedSharing: true,
      researcherDirectoryEnabled: true,
      collaborationTracking: true,
      dataAnonymization: false,
    },
    IPSeal: {
      timestampVerification: true,
      legalProofGeneration: true,
      documentHashValidation: true,
      ipTypeTracking: true,
    },
  });
  const moduleStatistics = ref({
    MediVault: {
      filesUploaded: 0,
      filesShared: 0,
      emergencyAccessRequests: 0,
      activeShares: 0,
    },
    BioKey: {
      filesUploaded: 0,
      filesShared: 0,
      collaborations: 0,
      researchersConnected: 0,
    },
    IPSeal: {
      filesUploaded: 0,
      timestampsCreated: 0,
      legalProofsGenerated: 0,
      verificationsPerformed: 0,
    },
  });
  const modulePermissions = ref({
    MediVault: {
      canUpload: true,
      canShare: true,
      canRequestEmergencyAccess: true,
      canManageProviders: false,
    },
    BioKey: {
      canUpload: true,
      canShare: true,
      canCollaborate: true,
      canAccessResearcherDirectory: true,
    },
    IPSeal: {
      canUpload: true,
      canCreateTimestamps: true,
      canGenerateLegalProofs: true,
      canVerifyDocuments: true,
    },
  });

  // Getters
  const currentModuleName = computed(() => {
    const moduleNames = {
      0: "MediVault",
      1: "BioKey",
      2: "IPSeal",
    };
    return moduleNames[currentModule.value] || "Unknown";
  });

  const currentModuleSettings = computed(() => {
    if (currentModule.value === null || currentModule.value === undefined)
      return null;
    return moduleSettings.value[currentModuleName.value] || {};
  });

  const currentModuleStatistics = computed(() => {
    if (currentModule.value === null || currentModule.value === undefined)
      return null;
    return moduleStatistics.value[currentModuleName.value] || {};
  });

  const currentModulePermissions = computed(() => {
    if (currentModule.value === null || currentModule.value === undefined)
      return null;
    return modulePermissions.value[currentModuleName.value] || {};
  });

  const totalFilesAcrossModules = computed(() => {
    return Object.values(moduleStatistics.value).reduce((total, stats) => {
      return total + (stats.filesUploaded || 0);
    }, 0);
  });

  const totalSharesAcrossModules = computed(() => {
    return Object.values(moduleStatistics.value).reduce((total, stats) => {
      return total + (stats.filesShared || 0);
    }, 0);
  });

  // Actions
  function setCurrentModule(moduleType) {
    currentModule.value = moduleType;
  }

  function updateModuleSettings(moduleName, settings) {
    if (moduleSettings.value[moduleName]) {
      moduleSettings.value[moduleName] = {
        ...moduleSettings.value[moduleName],
        ...settings,
      };
    }
  }

  function updateModuleStatistics(moduleName, stats) {
    if (moduleStatistics.value[moduleName]) {
      moduleStatistics.value[moduleName] = {
        ...moduleStatistics.value[moduleName],
        ...stats,
      };
    }
  }

  function updateModulePermissions(moduleName, permissions) {
    if (modulePermissions.value[moduleName]) {
      modulePermissions.value[moduleName] = {
        ...modulePermissions.value[moduleName],
        ...permissions,
      };
    }
  }

  function incrementFileUpload(moduleName) {
    if (moduleStatistics.value[moduleName]) {
      moduleStatistics.value[moduleName].filesUploaded += 1;
    }
  }

  function incrementFileShare(moduleName) {
    if (moduleStatistics.value[moduleName]) {
      moduleStatistics.value[moduleName].filesShared += 1;
    }
  }

  function incrementEmergencyAccessRequest() {
    if (moduleStatistics.value.MediVault) {
      moduleStatistics.value.MediVault.emergencyAccessRequests += 1;
    }
  }

  function incrementCollaboration() {
    if (moduleStatistics.value.BioKey) {
      moduleStatistics.value.BioKey.collaborations += 1;
    }
  }

  function incrementTimestampCreation() {
    if (moduleStatistics.value.IPSeal) {
      moduleStatistics.value.IPSeal.timestampsCreated += 1;
    }
  }

  function incrementLegalProofGeneration() {
    if (moduleStatistics.value.IPSeal) {
      moduleStatistics.value.IPSeal.legalProofsGenerated += 1;
    }
  }

  function incrementVerification() {
    if (moduleStatistics.value.IPSeal) {
      moduleStatistics.value.IPSeal.verificationsPerformed += 1;
    }
  }

  function resetModuleStatistics(moduleName) {
    if (moduleStatistics.value[moduleName]) {
      moduleStatistics.value[moduleName] = {
        filesUploaded: 0,
        filesShared: 0,
        emergencyAccessRequests: 0,
        activeShares: 0,
        collaborations: 0,
        researchersConnected: 0,
        timestampsCreated: 0,
        legalProofsGenerated: 0,
        verificationsPerformed: 0,
      };
    }
  }

  function resetAllModuleStatistics() {
    Object.keys(moduleStatistics.value).forEach((moduleName) => {
      resetModuleStatistics(moduleName);
    });
  }

  function getModuleInfo(moduleName) {
    return {
      settings: moduleSettings.value[moduleName] || {},
      statistics: moduleStatistics.value[moduleName] || {},
      permissions: modulePermissions.value[moduleName] || {},
    };
  }

  function getAllModulesInfo() {
    return {
      MediVault: getModuleInfo("MediVault"),
      BioKey: getModuleInfo("BioKey"),
      IPSeal: getModuleInfo("IPSeal"),
    };
  }

  function switchToModule(moduleType) {
    setCurrentModule(moduleType);

    // Emit module change event for components to react
    window.dispatchEvent(
      new CustomEvent("moduleChanged", {
        detail: {
          moduleType,
          moduleName: currentModuleName.value,
        },
      })
    );
  }

  function resetModuleStore() {
    currentModule.value = null;
    // Keep settings and permissions, but reset statistics
    resetAllModuleStatistics();
  }

  return {
    // State
    currentModule,
    moduleSettings,
    moduleStatistics,
    modulePermissions,

    // Getters
    currentModuleName,
    currentModuleSettings,
    currentModuleStatistics,
    currentModulePermissions,
    totalFilesAcrossModules,
    totalSharesAcrossModules,

    // Actions
    setCurrentModule,
    updateModuleSettings,
    updateModuleStatistics,
    updateModulePermissions,
    incrementFileUpload,
    incrementFileShare,
    incrementEmergencyAccessRequest,
    incrementCollaboration,
    incrementTimestampCreation,
    incrementLegalProofGeneration,
    incrementVerification,
    resetModuleStatistics,
    resetAllModuleStatistics,
    getModuleInfo,
    getAllModulesInfo,
    switchToModule,
    resetModuleStore,
  };
});
