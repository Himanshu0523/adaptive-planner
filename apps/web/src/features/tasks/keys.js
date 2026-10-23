export const taskKeys = {
    all: ["tasks"],
    lists: () => [...taskKeys.all, "list"],
    byGoal: (goalId, filters) => [...taskKeys.lists(), { goalId, ...filters }],
    today: (date) => [...taskKeys.lists(), { scope: "today", date }],
    details: () => [...taskKeys.all, "detail"],
    detail: (id) => [...taskKeys.details(), id],
};