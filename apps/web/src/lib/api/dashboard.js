export async function getDashboardData() {
  // Simulate network latency (perfect for testing your loading.js layout)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // In production, swap this with your actual database query or fetch() call
  // e.g., const res = await fetch('https://yourdomain.com');
  
  return {
    user: {
      name: "Mikey",
      greeting: "Good Evening Mikey!"
    },
    metrics: {
      totalEarnings: 10596.57,
      totalExpenses: 4166.80,
      goalsTarget: 5596.10,
      weeklyStats: 1257.12,
      portfolioBalance: 34010.00,
      portfolioChange: "+2.5%"
    },
    transactions: [
      { id: "tx_01", title: "Transfer to Mikey", type: "Personal", amount: -10100.00, date: "13 Sep, 2020 at 3:30 PM" },
      { id: "tx_02", title: "Investment to BGA", type: "Investments", amount: 50400.00, date: "10 Sep, 2020 at 3:30 PM" },
      { id: "tx_03", title: "Personal", type: "Personal", amount: -10100.00, date: "10 Sep, 2020 at 3:30 PM" },
      { id: "tx_04", title: "Cash withdrawal", type: "General", amount: -20905.00, date: "10 Sep, 2020 at 3:30 PM" }
    ]
  };
}