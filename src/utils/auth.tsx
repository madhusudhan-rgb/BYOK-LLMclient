import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "users";
const SESSION_KEY = "sessionUser";

// Get all users
export async function getUsers() {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

// Save users
export async function saveUsers(users: any) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Register user
export async function register(username: string, password: string) {
  const users = await getUsers();

  const exists = users.find((u: any) => u.username === username);
  if (exists) return false;

  users.push({ username, password });
  await saveUsers(users);
  return true;
}

// Login user
export async function login(username: string, password: string) {
  const users = await getUsers();

  const user = users.find(
    (u: any) => u.username === username && u.password === password
  );

  if (!user) return false;

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return true;
}

// Get session user
export async function getSession() {
  const data = await AsyncStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

// Logout
export async function logout() {
  await AsyncStorage.removeItem(SESSION_KEY);
}