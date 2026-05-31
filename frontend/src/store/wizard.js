import { create } from 'zustand';

const initial = {
  projectId: null,
  step: 1, // 1=Project, 2=Site, 3=Safety, 4=Photos, 5=Review
  site: null,
  safety: null,
  photos: [],
};

export const useWizard = create((set) => ({
  ...initial,
  setProjectId: (id) => set({ projectId: id, step: 2 }),
  setSite: (data) => set({ site: data, step: 3 }),
  setSafety: (data) => set({ safety: data, step: 4 }),
  setPhotos: (files) => set({ photos: files, step: 5 }),
  goTo: (step) => set({ step }),
  reset: () => set({ ...initial }),
}));
