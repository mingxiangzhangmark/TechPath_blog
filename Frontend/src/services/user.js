import api from "../api";

export async function registerUser(payload) {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    address,
    phone_number,
    security_answers,
  } = payload;

  const { data } = await api.post("/signup/", {
    username,
    email,
    password,
    first_name,
    last_name,
    address,
    phone_number,
    security_answers,
  });

  return data;
}
