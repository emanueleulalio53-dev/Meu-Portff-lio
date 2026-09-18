import { supabase } from "./supabase-config.js";

export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
}

export async function logout() {
    const { error } = await supabase.auth.signOut();
    return error ?? null;
}

export async function requireAuth(redirect = "login.html") {
    const user = await getCurrentUser();
    if (!user) {
        window.location.replace(redirect);
        return null;
    }
    return user;
}