export type InviteQrPayload = {
  kind: 'invite';
  token: string;
};

export type LoginQrPayload = {
  kind: 'login';
  email: string;
  password: string;
};

export type PhoenixCareQrPayload = InviteQrPayload | LoginQrPayload;

export function parsePhoenixCareQr(raw: string): PhoenixCareQrPayload | null {
  const value = raw.trim();
  if (!value) return null;

  const loginMatch = value.match(/^phoenixcare:\/\/login\/?\?(.*)$/i);
  if (loginMatch) {
    const params = new URLSearchParams(loginMatch[1]);
    const email = (params.get('email') || '').trim().toLowerCase();
    const password = params.get('password') || '';
    if (email.includes('@') && password.length >= 6) {
      return { kind: 'login', email, password };
    }
    return null;
  }

  try {
    if (value.startsWith('{')) {
      const json = JSON.parse(value) as {
        type?: string;
        email?: string;
        password?: string;
      };
      if (
        json.type === 'phoenixcare_login' &&
        typeof json.email === 'string' &&
        typeof json.password === 'string' &&
        json.email.includes('@') &&
        json.password.length >= 6
      ) {
        return {
          kind: 'login',
          email: json.email.trim().toLowerCase(),
          password: json.password,
        };
      }
    }
  } catch {
    /* not JSON */
  }

  const inviteMatch = value.match(/phoenixcare:\/\/invite\/([^/?#]+)/i);
  if (inviteMatch?.[1]) {
    return { kind: 'invite', token: decodeURIComponent(inviteMatch[1]) };
  }
  if (value.includes('/invite/')) {
    const part = value.split('/invite/')[1]?.split(/[/?#]/)[0];
    if (part) return { kind: 'invite', token: decodeURIComponent(part) };
  }

  if (value.length >= 10 && !value.includes(' ') && !value.includes('@')) {
    return { kind: 'invite', token: value };
  }

  return null;
}

export function extractInviteToken(raw: string): string {
  const parsed = parsePhoenixCareQr(raw);
  if (parsed?.kind === 'invite') return parsed.token;
  return raw.trim();
}
