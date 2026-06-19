// ═══════════════════════════════════════════════════════════════
// samaramAI — Firebase Error Mapping
// ═══════════════════════════════════════════════════════════════

/**
 * Maps raw Firebase Authentication error codes to user-friendly messages.
 * Reference: https://firebase.google.com/docs/auth/admin/errors
 *
 * @param code - The Firebase error code (e.g., 'auth/invalid-credential')
 * @returns A user-friendly error message
 */
export function mapAuthCodeToMessage(code: string): string {
  switch (code) {
    case 'auth/configuration-not-found':
      return 'Authentication is not enabled in your Firebase project! Please go to Firebase Console > Authentication > click "Get Started" to enable it.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
      return 'Invalid email or password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'This login method is not enabled. Please enable it in the Firebase Console.';
    case 'auth/popup-closed-by-user':
      return 'Login popup was closed before completing the sign-in.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request is allowed at one time.';
    case 'auth/missing-email':
      return 'Please provide an email address.';
    default:
      return `Authentication error: ${code.replace('auth/', '').replace(/-/g, ' ')}`;
  }
}
