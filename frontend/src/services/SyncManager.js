import DiffMatchPatch from 'diff-match-patch';
import api from '../api/axios';

class SyncManager {
    constructor(notebookId) {
        this.notebookId = notebookId;
        this.dmp = new DiffMatchPatch();
        this.sessionToken = null;
        this.baseVersion = null;
        this.baseContent = '';
        this.isSyncing = false;
    }

    /**
     * Start an editing session
     */
    async startSession() {
        try {
            const response = await api.post(`/api/sync/notebooks/${this.notebookId}/edit/`);
            const data = response.data;
            this.sessionToken = data.session_token;
            this.baseVersion = data.base_version;
            this.baseContent = data.base_content;
            console.log('Sync session started:', this.sessionToken);
            return data;
        } catch (error) {
            console.error('Failed to start sync session:', error);
            throw error;
        }
    }

    /**
     * Sync changes to the server
     * @param {string} currentContent - The current content in the editor
     * @returns {Promise<object>} - Result of the sync operation
     */
    async sync(currentContent) {
        if (!this.sessionToken) {
            throw new Error('No active sync session. Call startSession() first.');
        }

        if (this.isSyncing) {
            console.warn('Sync already in progress, skipping.');
            return null;
        }

        this.isSyncing = true;

        try {
            // Generate patches from base to current
            const patches = this.dmp.patch_make(this.baseContent, currentContent);
            const patchText = this.dmp.patch_toText(patches);

            // If no changes, we still send empty patch to pull updates from server
            // if (!patchText) {
            //     console.log('No changes to sync.');
            //     this.isSyncing = false;
            //     return { status: 'no_changes' };
            // }

            // console.log('Sending patch:', patchText);

            const response = await api.post(`/api/sync/notebooks/${this.notebookId}/apply-patch/`, {
                session_token: this.sessionToken,
                patch: patchText || ''
            });

            const result = response.data;

            if (result.status === 'success') {
                // Update base to the current content (which is now accepted by server)
                // Or use the content returned by server to be safe
                this.baseContent = result.content;
                this.baseVersion = result.version;
                console.log('Sync success. New version:', this.baseVersion);
            } else if (result.status === 'auto_merged') {
                // Server merged changes, we must update our base AND editor content
                this.baseContent = result.content;
                this.baseVersion = result.version;
                console.log('Auto-merged. New content received.');
            } else if (result.status === 'conflict') {
                console.warn('Conflict detected!');
            } else if (result.status === 'conflict_pending') {
                console.log('Conflict queued for review.');
            }

            return result;

        } catch (error) {
            if (error.response && error.response.status === 409) {
                console.warn('Conflict detected (409):', error.response.data);
                return error.response.data; // Return conflict data to be handled by UI
            }
            console.error('Sync failed:', error);
            throw error;
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Check server version
     * @returns {Promise<number>} - The server version
     */
    async checkVersion() {
        try {
            const response = await api.get(`/api/sync/notebooks/${this.notebookId}/check-version/`);
            return response.data.version;
        } catch (error) {
            console.error('Failed to check version:', error);
            return null;
        }
    }

    /**
     * Resolve a conflict
     * @param {number} conflictId 
     * @param {string} strategy - 'YOURS', 'THEIRS', 'MANUAL'
     * @param {string} finalContent - Required if strategy is MANUAL
     */
    async resolveConflict(conflictId, strategy, finalContent = null) {
        try {
            const payload = { resolution_strategy: strategy };
            if (strategy === 'MANUAL') {
                payload.final_content = finalContent;
            }

            const response = await api.post(`/api/sync/conflicts/${conflictId}/resolve/`, payload);
            const result = response.data;

            if (result.status === 'resolved') {
                // Update base state to the resolved content
                // We might need to fetch the latest notebook state or use what's returned if available
                // The resolve endpoint might not return the full content, so we might need to re-fetch or re-start session
                // But typically, after resolution, we should probably restart the session to be clean.
                console.log('Conflict resolved.');
                return result;
            }
        } catch (error) {
            console.error('Failed to resolve conflict:', error);
            throw error;
        }
    }
}

export default SyncManager;
