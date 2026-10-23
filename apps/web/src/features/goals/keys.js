export const goalKeys = {
  all: ["goals"],
  lists: () => [...goalKeys.all, "list"],
  list: (filters = {}) => [...goalKeys.lists(), filters],
  details: (id) => (id ? [...goalKeys.all, "detail", id] : [...goalKeys.all, "detail"]),
  detail: (id) => [...goalKeys.all, "detail", id],
};
