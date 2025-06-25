import { create } from "zustand";

const useUserStore = create((set) => ({
  code: "",
  name: "",

  setUser: (code, name) => set({ code, name }),
  clearUser: () => set({ code: "", name: "" }),
}));

export default useUserStore;
