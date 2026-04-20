// localStorage helpers for multi-workshop management

const WORKSHOPS_KEY = 'workshops';
const AUTH_KEY = 'admin_auth';

// ── Auth ──────────────────────────────────────────────

const ADMIN_USER = 'sathesh';
const ADMIN_PASS = 'sathesh';

export function adminLogin(username, password) {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user: ADMIN_USER, ts: Date.now() }));
    return true;
  }
  return false;
}

export function isAdminLoggedIn() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data.user === ADMIN_USER;
  } catch {
    return false;
  }
}

export function adminLogout() {
  sessionStorage.removeItem(AUTH_KEY);
}

import { supabase } from './supabase';

// ── Slug Utilities ────────────────────────────────────

export function generateSlug(title, existingSlugs = []) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = base || 'workshop';
  let counter = 1;

  // Avoid collisions
  while (existingSlugs.includes(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

// ── Workshop CRUD (Supabase) ──────────────────────────

export async function getAllWorkshops() {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .order('startTime', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to fetch workshops:', err);
    return [];
  }
}

export async function getWorkshopById(id) {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to fetch workshop by ID:', err);
    return null;
  }
}

export async function getWorkshopBySlug(slug) {
  if (!slug) return null;
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('slug', slug.toLowerCase())
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to fetch workshop by slug:', err);
    return null;
  }
}

export async function saveWorkshop(workshopData) {
  try {
    const now = new Date().toISOString();
    const { id, ...data } = workshopData;
    
    if (id) {
      // Update
      const { data: updated, error } = await supabase
        .from('workshops')
        .update({
          ...data,
          updatedAt: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    } else {
      // Create
      const { data: existing } = await supabase.from('workshops').select('slug');
      const slugs = existing?.map(w => w.slug) || [];
      
      const newWorkshop = {
        ...data,
        id: crypto.randomUUID(), // Reliable frontend-side UUID generation
        slug: generateSlug(data.title, slugs),
        createdAt: now,
        updatedAt: now
      };

      const { data: created, error } = await supabase
        .from('workshops')
        .insert([newWorkshop])
        .select()
        .single();

      if (error) throw error;
      return created;
    }
  } catch (err) {
    console.error('Failed to save workshop:', err);
    return null;
  }
}

export async function deleteWorkshop(id) {
  try {
    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete workshop:', err);
    return false;
  }
}

// ── Default Chat Messages ─────────────────────────────

export const DEFAULT_CHAT_MESSAGES = [
  { time: 5, name: "Rahul Sharma", message: "Hey everyone! Excited for this session 🙌" },
  { time: 15, name: "Priya Mehta", message: "Finally joined, been waiting for this!" },
  { time: 30, name: "Ankit Verma", message: "Can everyone hear the audio clearly?" },
  { time: 45, name: "Sneha Reddy", message: "Yes audio is perfect" },
  { time: 60, name: "Karan Singh", message: "Which topic are we covering first?" },
  { time: 80, name: "Deepika Patel", message: "This is going to be amazing! 🎉" },
  { time: 100, name: "Vikram Joshi", message: "I have been struggling with this for months" },
  { time: 120, name: "Rahul Sharma", message: "This is really useful information" },
  { time: 150, name: "Meera Nair", message: "Can you share the slides later?" },
  { time: 180, name: "Arjun Das", message: "Great explanation! Very clear 👍" },
  { time: 210, name: "Priya Mehta", message: "I had this exact problem last week" },
  { time: 240, name: "Rohan Gupta", message: "This makes so much more sense now" },
  { time: 270, name: "Anjali Kumar", message: "Is there a community group we can join?" },
  { time: 300, name: "Siddharth Rao", message: "Mind blown 🤯 Never thought of it this way" },
  { time: 340, name: "Neha Agarwal", message: "Taking notes furiously lol" },
  { time: 380, name: "Karan Singh", message: "This is worth every minute" },
  { time: 420, name: "Pooja Iyer", message: "Can you repeat that last point?" },
  { time: 470, name: "Rahul Sharma", message: "Bookmarking this for sure" },
  { time: 520, name: "Deepika Patel", message: "My team needs to see this" },
  { time: 580, name: "Vikram Joshi", message: "How do we get access to the resources?" },
  { time: 640, name: "Amit Tiwari", message: "Just joined! What did I miss?" },
  { time: 700, name: "Sneha Reddy", message: "This is the best webinar I've attended this year" },
  { time: 760, name: "Arjun Das", message: "Will there be a recording available?" },
  { time: 830, name: "Meera Nair", message: "I'm applying this tomorrow at work 💪" },
  { time: 900, name: "Priya Mehta", message: "Everyone should share this with their network" },
  { time: 980, name: "Rohan Gupta", message: "The practical examples are so helpful" },
  { time: 1060, name: "Anjali Kumar", message: "Thank you for making this so clear!" },
  { time: 1150, name: "Siddharth Rao", message: "Is there a certification after this?" },
  { time: 1250, name: "Neha Agarwal", message: "I've been looking for exactly this kind of training" },
  { time: 1350, name: "Karan Singh", message: "How much is the full course?" },
  { time: 1450, name: "Pooja Iyer", message: "Shut up and take my money 😂" },
  { time: 1560, name: "Deepika Patel", message: "Is there an early bird discount?" },
  { time: 1680, name: "Vikram Joshi", message: "I'm definitely enrolling!" },
  { time: 1800, name: "Rahul Sharma", message: "Thank you so much for this amazing session! 🙏" },
  { time: 1920, name: "Amit Tiwari", message: "Best investment I'll make this year" },
  { time: 2100, name: "Sneha Reddy", message: "Just enrolled! Can't wait to start 🚀" },
  { time: 2400, name: "Arjun Das", message: "Everyone seems to be enrolling, I better hurry!" },
  { time: 2700, name: "Priya Mehta", message: "The offer is live! Check the button below 👇" },
];
