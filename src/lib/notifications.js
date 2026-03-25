// Mock Capacitor Push Notification Service
export const NotificationService = {
  requestPermission: async () => {
    console.log("Push Permission Requested");
    return true;
  },
  
  notify: (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    } else {
      console.log(`[PUSH MOCK] ${title}: ${body}`);
      // Fallback: Custom In-app Toast logic can be added here
    }
  },

  scheduleRankingAlert: (name, position) => {
    NotificationService.notify(
      "Alerta de Ranking! 🏆",
      `${name} te passou! Você agora está em #${position} na turma.`
    );
  }
};
