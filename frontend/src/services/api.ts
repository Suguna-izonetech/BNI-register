import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Types ─────────────────────────────────────────────────────────
export interface Team {
  id: number;
  name: string;
}

export interface RegistrationPayload {
  team_name: string;
  player_name: string;
  phone_number: string;
  jersey_name: string;
  jersey_number: number;
  jersey_size: string;
  lower_size: string;
  photo?: File | null;
}

export interface OneToOnePayload {
  team_name: string;
  name: string;
  phone_number: string;
  business_name: string;
  business_category: string;
  photo?: File | null;
}

export interface FamilyPayload {
  team_name: string;
  name: string;
  phone_number: string;
  age_category: string;
  member_name: string;
  spouse_kids_name: string;
  selected_game: string;
  photo?: File | null;
}

export interface Registration {
  id: number;
  team_name: string;
  player_name: string;
  phone_number: string;
  jersey_name: string;
  jersey_number: number;
  jersey_size: string;
  lower_size: string;
  photo_url?: string | null;
  registered_at: string;
}

export interface OneToOneRegistration {
  id: number;
  team_name: string | null;
  name: string;
  phone_number: string;
  business_name: string | null;
  business_category: string | null;
  photo_url?: string | null;
  registered_at: string;
}

export interface FamilyRegistration {
  id: number;
  team_name: string | null;
  name: string;
  phone_number: string;
  age_category: string | null;
  member_name: string | null;
  spouse_kids_name: string | null;
  selected_game: string | null;
  photo_url?: string | null;
  registered_at: string;
}

// ── Public APIs ───────────────────────────────────────────────────
export const fetchTeams = (): Promise<Team[]> =>
  api.get('/teams').then((r) => r.data);

export const submitRegistration = (data: RegistrationPayload): Promise<{ message: string }> => {
  const fd = new FormData();
  fd.append('team_name', data.team_name);
  fd.append('player_name', data.player_name);
  fd.append('phone_number', data.phone_number);
  fd.append('jersey_name', data.jersey_name);
  fd.append('jersey_number', String(data.jersey_number));
  fd.append('jersey_size', data.jersey_size);
  fd.append('lower_size', data.lower_size);
  if (data.photo) fd.append('photo', data.photo, data.photo.name);
  return api.post('/register', fd).then((r) => r.data);
};

export const submitOneToOne = (data: OneToOnePayload): Promise<{ message: string }> => {
  const fd = new FormData();
  fd.append('team_name', data.team_name);
  fd.append('name', data.name);
  fd.append('phone_number', data.phone_number);
  fd.append('business_name', data.business_name);
  fd.append('business_category', data.business_category);
  if (data.photo) fd.append('photo', data.photo, data.photo.name);
  return api.post('/register/one-to-one', fd).then((r) => r.data);
};

export const submitFamily = (data: FamilyPayload): Promise<{ message: string }> => {
  const fd = new FormData();
  fd.append('team_name', data.team_name);
  fd.append('name', data.name);
  fd.append('phone_number', data.phone_number);
  fd.append('age_category', data.age_category);
  fd.append('member_name', data.member_name);
  fd.append('spouse_kids_name', data.spouse_kids_name);
  fd.append('selected_game', data.selected_game);
  if (data.photo) fd.append('photo', data.photo, data.photo.name);
  return api.post('/register/family', fd).then((r) => r.data);
};

// ── Admin APIs ────────────────────────────────────────────────────
export const adminLogin = (username: string, password: string): Promise<{ access_token: string; token_type: string }> =>
  api.post('/admin/login', { username, password }).then((r) => r.data);

export const fetchRegistrations = (): Promise<Registration[]> =>
  api.get('/admin/registrations').then((r) => r.data);

export const fetchOneToOneRegistrations = (): Promise<OneToOneRegistration[]> =>
  api.get('/admin/one-to-one').then((r) => r.data);

export const fetchFamilyRegistrations = (): Promise<FamilyRegistration[]> =>
  api.get('/admin/family').then((r) => r.data);

const downloadFile = async (url: string, filename: string) => {
  const token = localStorage.getItem('admin_token');
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Export failed');
  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export const exportExcel = () =>
  downloadFile('/admin/export', 'BNI_TPL_2026_Registrations.xlsx');

export const exportOneToOneExcel = () =>
  downloadFile('/admin/one-to-one/export', 'BNI_TPL_2026_OneToOne.xlsx');

export const exportFamilyExcel = () =>
  downloadFile('/admin/family/export', 'BNI_TPL_2026_Family.xlsx');

// ── Points Table / Matches ────────────────────────────────────────
export interface TeamStanding {
  rank: number;
  team_name: string;
  played: number;
  won: number;
  lost: number;
  no_result: number;
  points: number;
  nrr: number;
}

export interface Match {
  id: number;
  team1_name: string;
  team2_name: string;
  team1_score: number | null;
  team2_score: number | null;
  team1_overs: number | null;
  team2_overs: number | null;
  max_overs: number;
  winner: 'team1' | 'team2' | 'no_result' | null;
  match_date: string | null;
  stage: string;
  match_number: number | null;
  created_at: string;
}

export const fetchStandings = (stage = 'league'): Promise<TeamStanding[]> =>
  api.get('/standings', { params: { stage } }).then((r) => r.data);

export const fetchMatches = (): Promise<Match[]> =>
  api.get('/matches').then((r) => r.data);

// ── Admin Match Management ────────────────────────────────────────
export const adminAddMatch = (data: {
  team1_name: string;
  team2_name: string;
  match_date?: string;
  stage?: string;
  match_number?: number;
  max_overs?: number;
}): Promise<Match> =>
  api.post('/admin/matches', data).then((r) => r.data);

export const adminUpdateMatchResult = (
  matchId: number,
  result: {
    team1_score: number;
    team2_score: number;
    team1_overs: number;
    team2_overs: number;
    winner: 'team1' | 'team2' | 'no_result';
  }
): Promise<Match> =>
  api.put(`/admin/matches/${matchId}/result`, result).then((r) => r.data);

export const adminDeleteMatch = (matchId: number): Promise<void> =>
  api.delete(`/admin/matches/${matchId}`).then((r) => r.data);
