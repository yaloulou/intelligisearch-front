export function canAccessCcoc(user) {
  return user?.role === "admin" || (
    user?.role === "analyste" &&
    typeof user.desk === "string" &&
    user.desk.trim().toUpperCase() === "CCOC"
  );
}

export function homePath(user) {
  return canAccessCcoc(user) ? "/dashboard" : "/observations";
}

export function canReviewObservations(user) {
  return !!user?.role && typeof user.desk === "string" && user.desk.trim().toLowerCase() === "cord_intel";
}
