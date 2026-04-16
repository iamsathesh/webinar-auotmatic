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

// ── Slug Utilities ────────────────────────────────────

export function generateSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const existing = getAllWorkshops();
  let slug = base || 'workshop';
  let counter = 1;

  // Avoid collisions
  while (existing.some(w => w.slug === slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

// ── Workshop CRUD ─────────────────────────────────────

export function getAllWorkshops() {
  try {
    const raw = localStorage.getItem(WORKSHOPS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function getWorkshopById(id) {
  return getAllWorkshops().find(w => w.id === id) || null;
}

export function getWorkshopBySlug(slug) {
  if (!slug) return null;
  return getAllWorkshops().find(w => w.slug === slug.toLowerCase()) || null;
}

export function saveWorkshop(workshop) {
  try {
    const all = getAllWorkshops();
    const now = Date.now();

    if (workshop.id) {
      // Update existing
      const idx = all.findIndex(w => w.id === workshop.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...workshop, updatedAt: now };
      } else {
        all.push({ ...workshop, createdAt: now, updatedAt: now });
      }
    } else {
      // Create new
      workshop.id = `wk_${now}`;
      workshop.slug = generateSlug(workshop.title);
      workshop.createdAt = now;
      workshop.updatedAt = now;
      all.push(workshop);
    }

    localStorage.setItem(WORKSHOPS_KEY, JSON.stringify(all));
    return workshop;
  } catch (err) {
    console.error('Failed to save workshop:', err);
    return null;
  }
}

export function deleteWorkshop(id) {
  try {
    const all = getAllWorkshops().filter(w => w.id !== id);
    localStorage.setItem(WORKSHOPS_KEY, JSON.stringify(all));
    return true;
  } catch {
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
