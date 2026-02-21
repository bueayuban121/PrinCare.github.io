import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'pages/login.html'),
        dashboard: resolve(__dirname, 'pages/dashboard.html'),
        doctors: resolve(__dirname, 'pages/doctors.html'),
        schedule: resolve(__dirname, 'pages/schedule.html'),
        requests: resolve(__dirname, 'pages/requests.html'),
        notifications: resolve(__dirname, 'pages/notifications.html'),
        reports: resolve(__dirname, 'pages/reports.html'),
        settings: resolve(__dirname, 'pages/settings.html'),
        profile: resolve(__dirname, 'pages/profile.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: '/pages/login.html',
  },
});
