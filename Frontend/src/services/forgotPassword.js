import api from "../api";


export async function getSecurityQuestions(email) {
  const { data } = await api.post("/forget-password/start/", {
    email,
  });
  return data;
}


export async function verifySecurityAnswers(email, answers) {
  const { data } = await api.post("/forget-password/verify/", {
    email,
    answers,
  });
  return data;
}


export async function resetPassword(resetToken, newPassword, confirmPassword) {
  const { data } = await api.post("/forget-password/reset/", {
    reset_token: resetToken,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
  return data;
}
