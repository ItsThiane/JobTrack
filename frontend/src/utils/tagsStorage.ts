import { Tag } from '../lib/api';

export const tagsStorage = {
  saveTagsForCandidature: (candidatureId: number, tags: Tag[]) => {
    localStorage.setItem(`candidature-tags-${candidatureId}`, JSON.stringify(tags));
  },

  getTagsForCandidature: (candidatureId: number): Tag[] => {
    const stored = localStorage.getItem(`candidature-tags-${candidatureId}`);
    return stored ? JSON.parse(stored) : [];
  },

  deleteTagsForCandidature: (candidatureId: number) => {
    localStorage.removeItem(`candidature-tags-${candidatureId}`);
  },

  getAllTags: (): Tag[] => {
    const tags: Tag[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('candidature-tags-')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          tags.push(...JSON.parse(stored));
        }
      }
    }
    return [...new Map(tags.map((tag) => [tag.id, tag])).values()];
  },
};
