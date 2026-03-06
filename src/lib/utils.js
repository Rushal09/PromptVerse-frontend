import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(date) {
  if (!date) return "";
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now - target) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return formatDate(date);
  }
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export function formatPrice(price) {
  if (price === 0) return "Free";
  return `$${price.toFixed(2)}`;
}

export function formatCredits(credits) {
  if (credits >= 1000000) {
    return `${(credits / 1000000).toFixed(1)}M`;
  } else if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}K`;
  }
  return credits.toString();
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function generateAvatar(name) {
  if (!name) return "";
  const colors = [
    "#FF5733",
    "#33B5FF",
    "#FF33A8",
    "#33FF57",
    "#FFC300",
    "#8E44AD",
    "#16A085",
    "#E67E22",
    "#2C3E50",
    "#E74C3C",
  ];
  const bgColor = colors[name.charCodeAt(0) % colors.length];
  const initial = name[0].toUpperCase();
  const svg = `<svg width='128' height='128' xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' fill='${bgColor}'/><text x='50%' y='50%' font-size='64' font-family='Arial, Helvetica, sans-serif' fill='#fff' text-anchor='middle' alignment-baseline='central' dominant-baseline='central'>${initial}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
