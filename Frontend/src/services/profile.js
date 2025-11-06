import api from "../api";

export function fetchProfile() {
  return api.get("/profile/");
}

export function updateProfile(form, avatarFile) {
  const fd = new FormData();
  ["first_name", "last_name", "address", "phone_number"].forEach((k) => {
    fd.append(k, form[k] ?? "");
  });
  ["bio", "linkedin", "github", "facebook", "x_twitter", "website"].forEach(
    (k) => {
      fd.append(`profile.${k}`, form[k] ?? "");
    },
  );
  if (avatarFile) {
    fd.append("profile.avatar", avatarFile);
  }
  return api.put("/profile/", fd);
}
