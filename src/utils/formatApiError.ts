const MESSAGE_MAP: Record<string, string> = {
  "All fields are required: fullname, username, email, password.":
    "Please fill in all fields: full name, username, email, and password.",
  "Email and password are required.":
    "Please enter your email and password.",
  "limit and offset must be valid numbers.":
    "Invalid list parameters. Please refresh the page.",
  "Room name is required":
    "Please enter a room name.",
  "Room id is required":
    "Please select a room.",
  "Valid userId is required":
    "Session issue. Please log in again.",
  "Start date must be before end date":
    "The start time must be before the end time.",
  "Booking id is required":
    "Booking could not be identified. Please try again.",
  "Validation error on parameters.":
    "Invalid request. Please check the link or try again.",
  "Validation error on request body.":
    "Please check your input and try again.",
  "Validation error on query parameters.":
    "Invalid filters. Please adjust and try again.",
  "Authorization header is missing. Please log in to continue.":
    "Please log in to continue.",
  "Token not found. Use format: Bearer <token>.":
    "Session invalid. Please log in again.",
  "Invalid or expired token. Please log in again.":
    "Your session has expired. Please log in again.",
  "Invalid credentials. User not found.":
    "No account found with this email.",
  "Invalid credentials. Invalid password.":
    "Incorrect password. Please try again.",
  "User not provided. Please log in or send a valid token.":
    "Please log in to continue.",
  "You are not authorized to delete this booking":
    "You can only delete your own bookings.",
  "Room not found":
    "This room no longer exists or was removed.",
  "User not found":
    "User not found. Please try again.",
  "Booking not found":
    "This booking no longer exists or was already removed.",
  "A user with this email already exists.":
    "An account with this email already exists. Try logging in or use another email.",
  "A room with this name already exists":
    "A room with this name already exists. Please choose a different name.",
  "Room has bookings. Delete them before deleting the room":
    "This room has existing bookings. Delete or move them first, then delete the room.",
  "The requested booking overlaps with one or more existing bookings.":
    "This time slot is already booked. Please choose another time.",
  "Booking is active. Deactivate it before deleting":
    "This booking is still active. Deactivate it before deleting.",
  "Internal server error. Registration could not be completed.":
    "We couldn’t complete registration. Please try again later.",
  "Internal server error. Login could not be completed.":
    "We couldn’t sign you in. Please try again later.",
  "Internal server error":
    "Something went wrong. Please try again later.",
  "Internal server error while validating the request.":
    "We couldn’t process your request. Please try again later.",
};

const INVALID_KEYS_PREFIX = "Invalid keys in body:";
const INVALID_KEYS_QUERY_PREFIX = "Invalid query parameters:";

function mapKnownMessage(message: string): string {
  const trimmed = message.trim();
  if (MESSAGE_MAP[trimmed]) return MESSAGE_MAP[trimmed];
  if (trimmed.startsWith(INVALID_KEYS_PREFIX)) {
    return "Some fields are not allowed. Please only fill in the requested fields.";
  }
  if (trimmed.startsWith(INVALID_KEYS_QUERY_PREFIX)) {
    return "Invalid filters. Please use only the allowed options.";
  }
  if (trimmed.includes("Path parameter id is required") || trimmed.includes("is required")) {
    return "Required information is missing. Please check the form and try again.";
  }
  if (trimmed.includes("Title must be between 3 and 80 characters")) {
    return "Title must be between 3 and 80 characters.";
  }
  if (trimmed.includes("Start date is required") || trimmed.includes("start_at")) {
    return "Please enter a valid start date and time.";
  }
  if (trimmed.includes("End date is required") || trimmed.includes("end_at")) {
    return "Please enter a valid end date and time.";
  }
  if (trimmed.includes("ISO 8601")) {
    return "Please use a valid date and time format.";
  }
  if (trimmed.includes("limit must be") || trimmed.includes("offset must be")) {
    return "Invalid list options. Please refresh and try again.";
  }
  if (trimmed.includes("from is required") || trimmed.includes("to is required")) {
    return "Please set a valid date range.";
  }
  if (trimmed.includes("userId")) {
    return "Session issue. Please log in again.";
  }
  return trimmed;
}

export interface FormatApiErrorOptions {
  errors?: string[];
  conflictingRanges?: unknown;
}

export function formatApiError(
  message: string,
  options?: FormatApiErrorOptions
): string {
  const main = mapKnownMessage(message);
  const parts: string[] = [main];
  if (options?.errors?.length) {
    const first = options.errors[0];
    if (first && first !== message) {
      const friendly = mapKnownMessage(first);
      if (friendly !== main) parts.push(friendly);
    }
  }
  if (options?.conflictingRanges != null && Array.isArray(options.conflictingRanges) && options.conflictingRanges.length > 0) {
    parts.push("Choose a time that doesn’t overlap with existing bookings.");
  }
  return parts.length > 1 ? parts.join(" ") : parts[0];
}

export function formatApiErrorResponse(
  data: { message?: string; error?: string; errors?: string[]; conflictingRanges?: unknown }
): string {
  const message = data.message ?? data.error ?? "Something went wrong. Please try again.";
  return formatApiError(message, {
    errors: data.errors,
    conflictingRanges: data.conflictingRanges,
  });
}
