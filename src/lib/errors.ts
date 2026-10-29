export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Array<{ path: string; code: string; message: string }> | null;
}

export class ApiException extends Error {
  static readonly networkCode = 'NETWORK_ERROR';
  static readonly timeoutCode = 'TIMEOUT_ERROR';

  readonly status: number;
  readonly code: string;
  readonly details?: Array<{ path: string; code: string; message: string }> | null;

  constructor(params: {
    status: number;
    code: string;
    message: string;
    details?: Array<{ path: string; code: string; message: string }> | null;
  }) {
    super(params.message);
    this.name = 'ApiException';
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }

  get isNetwork(): boolean {
    return this.code === ApiException.networkCode;
  }

  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
}

/**
 * Exact mapping from server `docs/ERROR_CODES.md` to translation keys in `messages/{en,bn}.json`.
 */
export const ERROR_CODE_TO_MESSAGE_KEY: Record<string, string> = {
  // generic
  VALIDATION_ERROR: 'errValidation',
  RATE_LIMITED: 'errRateLimited',
  PAYLOAD_TOO_LARGE: 'errMediaTooLarge',
  NOT_FOUND: 'errNotFound',
  ROUTE_NOT_FOUND: 'errNotFound',
  SERVICE_UNAVAILABLE: 'errServer',
  INTERNAL_ERROR: 'errServer',
  // auth
  AUTH_UNAUTHENTICATED: 'errSessionExpired',
  AUTH_TOKEN_EXPIRED: 'errSessionExpired',
  AUTH_INVALID_REFRESH_TOKEN: 'errSessionExpired',
  AUTH_REFRESH_EXPIRED: 'errSessionExpired',
  AUTH_REFRESH_REUSED: 'errSessionExpired',
  AUTH_FORBIDDEN: 'errForbidden',
  AUTH_ACCOUNT_SUSPENDED: 'errAccountSuspended',
  AUTH_INVALID_CREDENTIALS: 'errInvalidCredentials',
  AUTH_EMAIL_TAKEN: 'errEmailTaken',
  AUTH_WRONG_PASSWORD: 'errWrongPassword',
  AUTH_PASSWORD_REQUIRED: 'errPasswordRequired',
  AUTH_NO_EMAIL: 'errNoEmail',
  AUTH_INVALID_OTP: 'errInvalidOtp',
  AUTH_OTP_EXPIRED: 'errOtpExpired',
  AUTH_OTP_TOO_MANY_ATTEMPTS: 'errOtpTooMany',
  AUTH_OTP_COOLDOWN: 'errOtpCooldown',
  AUTH_OTP_LIMIT: 'errOtpLimit',
  AUTH_SMS_UNAVAILABLE: 'errSmsUnavailable',
  SMS_SEND_FAILED: 'errSmsUnavailable',
  AUTH_EMAIL_ALREADY_VERIFIED: 'errEmailAlreadyVerified',
  AUTH_INVALID_SOCIAL_TOKEN: 'errSocialFailed',
  AUTH_PROVIDER_NOT_CONFIGURED: 'errProviderUnavailable',
  AUTH_PROVIDER_ALREADY_LINKED: 'errProviderLinked',
  AUTH_PROVIDER_NOT_LINKED: 'errNotFound',
  AUTH_LAST_LOGIN_METHOD: 'errLastLoginMethod',
  AUTH_DELETE_NOT_CONFIRMED: 'errValidation',
  USER_PHONE_TAKEN: 'errPhoneTaken',
  USER_PHONE_LOCKED: 'errPhoneLocked',
  // media
  MEDIA_TOO_LARGE: 'errMediaTooLarge',
  MEDIA_UNSUPPORTED_TYPE: 'errMediaType',
  MEDIA_FILE_REQUIRED: 'errMediaType',
  MEDIA_INVALID_UPLOAD: 'errMediaType',
  STORAGE_UPLOAD_FAILED: 'errUploadFailed',
  STORAGE_NOT_CONFIGURED: 'errUploadFailed',
  // players
  PLAYER_PROFILE_EXISTS: 'errProfileExists',
  PLAYER_PROFILE_NOT_FOUND: 'errPlayerNotFound',
  PLAYER_PROFILE_REQUIRED: 'errProfileRequired',
  PLAYER_SPORT_REQUIRED: 'errSportRequired',
  PLAYER_SPORT_EXISTS: 'errSportExists',
  PLAYER_SPORT_NOT_FOUND: 'errNotFound',
  PLAYER_ACHIEVEMENT_LIMIT: 'errAchievementLimit',
  PLAYER_ACHIEVEMENT_NOT_FOUND: 'errNotFound',
  // credits, contact, invites, chat, teams, verification
  CREDITS_REQUIRED: 'errCreditsRequired',
  CONTACT_LOCKED: 'errContactLocked',
  PLAYER_NO_PHONE: 'errPlayerNoPhone',
  INVITE_ALREADY_PENDING: 'errInviteAlreadyPending',
  INVITE_COOLDOWN: 'errInviteCooldown',
  INVITE_LIMIT: 'errInviteLimit',
  INVITE_NOT_PENDING: 'errInviteNotPending',
  INVITE_NOT_FOUND: 'errNotFound',
  CHAT_UNAVAILABLE: 'errChatUnavailable',
  CHAT_LIMIT: 'errChatLimit',
  CONVERSATION_NOT_FOUND: 'errNotFound',
  TEAM_CODE_INVALID: 'errTeamCodeInvalid',
  TEAM_ALREADY_MEMBER: 'errTeamAlreadyMember',
  TEAM_FULL: 'errTeamFull',
  TEAM_LIMIT: 'errTeamLimit',
  TEAM_CAPTAIN_CANNOT_LEAVE: 'errTeamCaptainCannotLeave',
  TEAM_NOT_FOUND: 'errNotFound',
  TEAM_NOT_CAPTAIN: 'errForbidden',
  TEAM_MEMBER_NOT_FOUND: 'errNotFound',
  PAYMENT_TRX_USED: 'errPaymentTrxUsed',
  PAYMENT_TOO_MANY_OPEN: 'errPaymentTooManyOpen',
  PAYMENT_METHOD_UNAVAILABLE: 'errPaymentUnavailable',
  PAYMENT_NOT_FOUND: 'errNotFound',
  PAYMENT_NOT_SUBMITTABLE: 'errValidation',
  CREDIT_PACK_NOT_FOUND: 'errNotFound',
  VERIFICATION_PENDING: 'errVerificationPending',
  ALREADY_VERIFIED: 'errAlreadyVerified',
  EVENT_RECRUITERS_ONLY: 'errEventRecruitersOnly',
  BOOST_UNAVAILABLE: 'errBoostUnavailable',
  SHORTLIST_FULL: 'errShortlistFull',
  // recruiters & admin
  RECRUITER_PROFILE_REQUIRED: 'errRecruiterProfileRequired',
  RECRUITER_PROFILE_EXISTS: 'errRecruiterExists',
  RECRUITER_PROFILE_NOT_FOUND: 'errNotFound',
  AUTH_ADMIN_DASHBOARD_ONLY: 'errAdminDashboardOnly',
  PLAYER_MEDIA_LIMIT: 'errMediaLimit',
  PLAYER_MEDIA_NOT_FOUND: 'errNotFound',
  LOCATION_INVALID: 'errLocationInvalid',
  // requests & applications
  REQUEST_NOT_FOUND: 'errRequestNotFound',
  REQUEST_NOT_OWNER: 'errForbidden',
  REQUEST_NOT_OPEN: 'errRequestNotOpen',
  REQUEST_FILLED: 'errRequestFilled',
  REQUEST_EXPIRED: 'errRequestExpired',
  REQUEST_CLOSED: 'errRequestClosed',
  REQUEST_LIMIT: 'errRequestLimit',
  REQUEST_OWN: 'errRequestOwn',
  REQUEST_NOT_STARTED: 'errRequestNotStarted',
  REQUEST_NO_ACCEPTED_PLAYERS: 'errNoAcceptedPlayers',
  APPLICATION_EXISTS: 'errApplicationExists',
  APPLICATION_NOT_FOUND: 'errNotFound',
  APPLICATION_NOT_PENDING: 'errApplicationNotPending',
  // ratings & reports
  RATING_EXISTS: 'errRatingExists',
  RATING_WINDOW_CLOSED: 'errRatingWindow',
  REQUEST_NOT_COMPLETED: 'errRatingNotCompleted',
  RATING_NOT_PARTICIPANT: 'errForbidden',
  RATING_NOT_ELIGIBLE: 'errRatingNotEligible',
  RATING_TARGET_NOT_FOUND: 'errNotFound',
  REPORT_EXISTS: 'errReportExists',
  REPORT_TARGET_NOT_FOUND: 'errNotFound',
  // notifications
  NOTIFICATION_NOT_FOUND: 'errNotFound',
};

/**
 * Translate any error into a localized user-facing string using next-intl `t`.
 */
export function getErrorText(t: (key: string) => string, error: unknown): string {
  if (error instanceof ApiException) {
    const key = ERROR_CODE_TO_MESSAGE_KEY[error.code];
    if (key) return t(key);
    if (error.code === ApiException.networkCode) return t('errNetwork');
    if (error.code === ApiException.timeoutCode) return t('errTimeout');
    if (error.isServerError) return t('errServer');
    if (error.status === 403) return t('errForbidden');
    if (error.status === 404) return t('errNotFound');
    if (error.status === 429) return t('errRateLimited');
  }
  return t('errUnknown');
}

